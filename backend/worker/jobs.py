import os
import io
import uuid
import zipfile
from typing import Dict, List, Optional
from datetime import datetime
from rq import Queue

from app.dependencies import SessionLocal, supabase
from app.models import BulkJob, Template
from app.services.page_service import generate_page
from app.services.storage_service import StorageService
from worker.redis_conn import get_redis_connection
from sqlalchemy.exc import PendingRollbackError

redis_conn = get_redis_connection()


def _pick_value(variables: Dict[str, str], keys: List[str]) -> Optional[str]:
    for key in keys:
        value = variables.get(key)
        if value:
            return str(value)
    for k, v in variables.items():
        if any(token in k.lower() for token in keys):
            if v:
                return str(v)
    return None


def process_bulk_job(job_id: str, user_id: str, template_id: str, rows: List[Dict[str, str]]):
    """Process bulk page generation job from parsed CSV rows."""
    db = SessionLocal()
    storage = StorageService(supabase)

    def update_job(
        status: str,
        processed: int,
        failed: int,
        total: int,
        urls: List[Dict],
        errors: List[Dict],
    ) -> None:
        try:
            db.rollback()
        except PendingRollbackError:
            db.rollback()
        job = db.query(BulkJob).filter(BulkJob.id == job_id).first()
        if not job:
            return
        job.status = status
        job.processed_rows = processed
        job.failed_rows = failed
        job.total_rows = total
        job.updated_at = datetime.utcnow()
        job.result_urls = urls
        job.errors = errors
        db.commit()

    try:
        update_job("processing", 0, 0, len(rows), [], [])

        template = (
            db.query(Template)
            .filter(Template.id == template_id, Template.user_id == user_id)
            .first()
        )
        if not template:
            raise ValueError("Template not found")

        total_rows = len(rows)
        processed = 0
        failed = 0
        result_urls: List[Dict] = []
        zip_entries: List[Dict[str, str]] = []
        errors: List[Dict] = []

        for i, row in enumerate(rows):
            try:
                variables = {str(k).strip(): v for k, v in (row or {}).items()}

                title = _pick_value(variables, ["title", "name"]) or f"Page {i + 1}"
                meta_description = (
                    _pick_value(variables, ["meta_description", "description"]) or title
                )
                slug = _pick_value(variables, ["slug"])

                page, url = generate_page(
                    db=db,
                    template=template,
                    user_id=user_id,
                    variables=variables,
                    title=title[:255],
                    meta_description=meta_description[:255],
                    slug=slug,
                    storage=storage,
                    is_bulk=True,
                )

                result_urls.append(
                    {
                        "url": url,
                        "title": page.title,
                        "slug": page.slug,
                        "seo_score": page.seo_score,
                    }
                )
                zip_entries.append(
                    {
                        "filename": f"{page.slug}.html",
                        "content": page.html_content or "",
                    }
                )
                processed += 1

                if (i + 1) % 10 == 0 or i == total_rows - 1:
                    update_job("processing", processed, failed, total_rows, result_urls, errors)
            except Exception as exc:
                db.rollback()
                failed += 1
                errors.append(
                    {
                        "row": i + 1,
                        "error": str(exc),
                        "data": {k: str(v)[:100] for k, v in (row or {}).items()},
                    }
                )

        # Build zip for bulk downloads (URLs + HTML files)
        if zip_entries:
            buffer = io.BytesIO()
            with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                urls_text = "\n".join([item["url"] for item in result_urls if item.get("url")])
                zf.writestr("urls.txt", urls_text)
                for entry in zip_entries:
                    zf.writestr(entry["filename"], entry["content"])
            buffer.seek(0)

            zip_key = f"{user_id}/bulk-{job_id}.zip"
            storage.upload_bytes_with_key(zip_key, buffer.read(), "application/zip")
            zip_url = storage.get_public_url(zip_key)
            result_urls.append({"type": "zip", "url": zip_url})

        status = "completed" if failed == 0 else "completed_with_errors"
        update_job(status, processed, failed, total_rows, result_urls, errors)
    except Exception as exc:
        update_job("failed", 0, 0, len(rows), [], [{"error": str(exc)}])
        raise
    finally:
        db.close()


def create_bulk_job(user_id: str, template_id: str, rows: List[Dict[str, str]]) -> str:
    """Create and enqueue a bulk job from parsed rows."""
    job_id = str(uuid.uuid4())
    queue = Queue("bulk", connection=redis_conn)

    enqueue_kwargs = {"job_timeout": 3600}
    if os.name == "nt":
        enqueue_kwargs.pop("job_timeout", None)

    queue.enqueue(
        "worker.jobs.process_bulk_job",
        job_id,
        user_id,
        template_id,
        rows,
        **enqueue_kwargs,
    )

    return job_id
