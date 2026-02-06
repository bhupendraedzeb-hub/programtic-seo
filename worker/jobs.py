from __future__ import annotations

from typing import List, Dict
import logging
import io
import zipfile
from sqlalchemy.orm import Session

from app.dependencies import SessionLocal, supabase
from app.models import Template, BulkJob, Page
from app.services.page_service import generate_page
from app.services.template_service import render_template
from app.services.storage_service import StorageService
from app.utils.seo import validate_seo


def process_bulk_job(
    job_id: str,
    user_id: str,
    template_id: str,
    rows: List[Dict[str, str]],
):
    db: Session = SessionLocal()
    storage = StorageService(supabase)
    try:
        job = db.query(BulkJob).filter(BulkJob.id == job_id, BulkJob.user_id == user_id).first()
        template = db.query(Template).filter(Template.id == template_id, Template.user_id == user_id).first()
        if not job or not template:
            return

        job.status = "processing"
        db.commit()
        logger.info("bulk_job_processing job_id=%s user_id=%s rows=%s", job_id, user_id, len(rows))

        required_vars = set(template.variables or [])
        generated_files: List[Dict[str, str]] = []
        for row in rows:
            try:
                missing = required_vars - set(row.keys())
                if missing:
                    raise ValueError(f"Missing variables: {', '.join(sorted(missing))}")
                title = row.get("title") or row.get("page_title") or ""
                meta_description = row.get("meta_description") or row.get("description") or ""
                if not title or not meta_description:
                    raise ValueError("Missing title or meta_description.")

                existing = (
                    db.query(Page)
                    .filter(Page.user_id == user_id, Page.title == title)
                    .first()
                )
                if existing:
                    raise ValueError("Duplicate title detected.")

                existing_desc = (
                    db.query(Page)
                    .filter(Page.user_id == user_id, Page.meta_description == meta_description)
                    .first()
                )
                if existing_desc:
                    raise ValueError("Duplicate meta description detected.")

                rendered_preview = render_template(template.html_content, row)
                score, seo_data = validate_seo(rendered_preview, title, meta_description)
                if seo_data["issues"]:
                    logger.info(
                        "bulk_job_seo_issues job_id=%s issues=%s",
                        job_id,
                        "; ".join(seo_data["issues"]),
                    )

                page, url = generate_page(
                    db=db,
                    template=template,
                    user_id=user_id,
                    variables=row,
                    title=title,
                    meta_description=meta_description,
                    slug=row.get("slug"),
                    storage=storage,
                    is_bulk=True,
                )
                page.status = "completed"
                db.commit()

                job.result_urls = (job.result_urls or []) + [
                    {"page_id": page.id, "url": url, "slug": page.slug}
                ]
                generated_files.append(
                    {
                        "filename": f"{page.slug}.html",
                        "content": page.html_content,
                    }
                )
                job.processed_rows += 1
            except Exception as exc:
                job.failed_rows += 1
                job.errors = (job.errors or []) + [{"row": row, "error": str(exc)}]
                logger.warning("bulk_job_row_failed job_id=%s error=%s", job_id, str(exc))
            finally:
                db.commit()

        job.status = "completed" if job.failed_rows == 0 else "completed_with_errors"
        db.commit()
        logger.info("bulk_job_completed job_id=%s status=%s processed=%s failed=%s", job_id, job.status, job.processed_rows, job.failed_rows)

        # Build ZIP for bulk jobs (skip for single-page jobs).
        if job.csv_filename and job.csv_filename != "single-page.csv" and generated_files:
            buffer = io.BytesIO()
            with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
                for item in generated_files:
                    zipf.writestr(item["filename"], item["content"])
            buffer.seek(0)
            zip_key = f"{user_id}/bulk-{job.id}.zip"
            storage.upload_bytes_with_key(zip_key, buffer.read(), "application/zip")
            zip_url = storage.get_public_url(zip_key)
            job.result_urls = (job.result_urls or []) + [
                {"type": "zip", "url": zip_url, "filename": f"bulk-{job.id}.zip"}
            ]
            db.commit()
    finally:
        db.close()
logger = logging.getLogger("worker.bulk")
