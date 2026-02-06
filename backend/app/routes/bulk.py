import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import csv
import io
import os

from rq import Queue, Retry
from redis import Redis

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models import Template, BulkJob
from app.schemas import BulkJobResponse, BulkJobListResponse

router = APIRouter()
logger = logging.getLogger("app.bulk")


def get_queue() -> Queue:
    redis_conn = Redis.from_url(settings.redis_url)
    return Queue("bulk", connection=redis_conn)


@router.post("/", response_model=BulkJobResponse)
def create_bulk_job(
    template_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    logger.info("bulk_job_start user=%s template_id=%s filename=%s", current_user["id"], template_id, file.filename)
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.user_id == current_user["id"])
        .first()
    )
    if not template:
        logger.warning("bulk_template_not_found user=%s template_id=%s", current_user["id"], template_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)

    if not rows:
        logger.warning("bulk_empty_csv user=%s", current_user["id"])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV has no rows")

    required_vars = set(template.variables or [])
    header_vars = set(reader.fieldnames or [])
    missing = required_vars - header_vars
    if missing:
        logger.warning("bulk_missing_columns user=%s missing=%s", current_user["id"], ",".join(sorted(missing)))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV missing required columns: {', '.join(sorted(missing))}",
        )

    job = BulkJob(
        user_id=current_user["id"],
        template_id=template.id,
        csv_filename=file.filename,
        total_rows=len(rows),
        status="queued",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    queue = get_queue()
    enqueue_kwargs = {
        "job_timeout": 600,
        "retry": Retry(max=3),
    }
    # Windows doesn't support SIGALRM (used by RQ timeouts)
    if os.name == "nt":
        enqueue_kwargs.pop("job_timeout", None)

    queue.enqueue(
        "worker.jobs.process_bulk_job",
        job.id,
        current_user["id"],
        template.id,
        rows,
        **enqueue_kwargs,
    )
    logger.info("bulk_job_enqueued user=%s job_id=%s", current_user["id"], job.id)

    return job


@router.get("/", response_model=list[BulkJobListResponse])
def list_bulk_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return (
        db.query(BulkJob)
        .filter(BulkJob.user_id == current_user["id"])
        .order_by(BulkJob.created_at.desc())
        .all()
    )


@router.get("/{job_id}", response_model=BulkJobResponse)
def get_bulk_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    job = (
        db.query(BulkJob)
        .filter(BulkJob.id == job_id, BulkJob.user_id == current_user["id"])
        .first()
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.delete("/{job_id}")
def delete_bulk_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    job = (
        db.query(BulkJob)
        .filter(BulkJob.id == job_id, BulkJob.user_id == current_user["id"])
        .first()
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Bulk job deleted"}
