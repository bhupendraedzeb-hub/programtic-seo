from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies import get_db, get_current_user
from app.models import BulkJob

router = APIRouter()


@router.get("/stats")
def job_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    total = db.query(func.count(BulkJob.id)).filter(BulkJob.user_id == current_user["id"]).scalar()
    queued = db.query(func.count(BulkJob.id)).filter(BulkJob.user_id == current_user["id"], BulkJob.status == "queued").scalar()
    processing = db.query(func.count(BulkJob.id)).filter(BulkJob.user_id == current_user["id"], BulkJob.status == "processing").scalar()
    completed = db.query(func.count(BulkJob.id)).filter(BulkJob.user_id == current_user["id"], BulkJob.status == "completed").scalar()
    failed = db.query(func.count(BulkJob.id)).filter(BulkJob.user_id == current_user["id"], BulkJob.status == "failed").scalar()

    return {
        "total_jobs": total or 0,
        "queued": queued or 0,
        "processing": processing or 0,
        "completed": completed or 0,
        "failed": failed or 0,
    }


@router.get("/recent")
def recent_jobs(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    jobs = (
        db.query(BulkJob)
        .filter(BulkJob.user_id == current_user["id"])
        .order_by(BulkJob.created_at.desc())
        .limit(limit)
        .all()
    )
    return jobs
