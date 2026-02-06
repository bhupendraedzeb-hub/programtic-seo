import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, supabase
from app.models import Template, Page
from app.schemas import PageCreate, PageResponse, PageListResponse
from app.services.page_service import generate_page
from app.services.template_service import render_template
from app.services.storage_service import StorageService
from app.utils.seo import validate_seo

router = APIRouter()
logger = logging.getLogger("app.pages")


@router.post("/", response_model=PageResponse)
def create_page(
    payload: PageCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    logger.info("create_page_start user=%s template_id=%s", current_user["id"], payload.template_id)
    try:
        variable_keys = sorted(payload.variables.keys())
        title_value = payload.title or payload.variables.get("title") or ""
        meta_value = payload.meta_description or payload.variables.get("meta_description") or ""
        logger.debug(
            "create_page_payload user=%s vars=%s vars_count=%s title_len=%s meta_len=%s slug=%s",
            current_user["id"],
            ",".join(variable_keys),
            len(variable_keys),
            len(title_value),
            len(meta_value),
            payload.slug or "",
        )
    except Exception:
        logger.debug("create_page_payload user=%s payload_log_failed", current_user["id"])
    template = (
        db.query(Template)
        .filter(Template.id == payload.template_id, Template.user_id == current_user["id"])
        .first()
    )
    if not template:
        logger.warning("template_not_found user=%s template_id=%s", current_user["id"], payload.template_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    required_vars = set(template.variables or [])
    provided_vars = set(payload.variables.keys())
    missing_vars = required_vars - provided_vars
    if missing_vars:
        logger.warning("missing_vars user=%s vars=%s", current_user["id"], ",".join(sorted(missing_vars)))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing variables: {', '.join(sorted(missing_vars))}",
        )

    title = payload.title or payload.variables.get("title") or ""
    meta_description = payload.meta_description or payload.variables.get("meta_description") or ""

    if not title:
        title = "Untitled Page"
    if not meta_description:
        meta_description = ""

    base_title = title
    suffix = 2
    while True:
        existing_title = (
            db.query(Page)
            .filter(Page.user_id == current_user["id"], Page.title == title)
            .first()
        )
        if not existing_title:
            break
        title = f"{base_title} ({suffix})"
        suffix += 1

    # Allow duplicate meta descriptions.

    # Skip SEO enforcement during page creation (allow short content and shorter meta fields).
    try:
        rendered_preview = render_template(template.html_content, payload.variables)
    except ValueError as exc:
        logger.warning(
            "template_render_failed user=%s template_id=%s error=%s",
            current_user["id"],
            payload.template_id,
            str(exc),
        )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    score, seo_data = validate_seo(rendered_preview, title, meta_description)
    if seo_data.get("issues"):
        logger.info(
            "seo_issues_not_enforced user=%s issues=%s",
            current_user["id"],
            "; ".join(seo_data["issues"]),
        )

    storage = StorageService(supabase)
    page, _ = generate_page(
        db=db,
        template=template,
        user_id=current_user["id"],
        variables=payload.variables,
        title=title,
        meta_description=meta_description,
        slug=payload.slug,
        storage=storage,
        is_bulk=False,
    )
    logger.info("create_page_success user=%s page_id=%s", current_user["id"], page.id)
    return page


@router.get("/", response_model=List[PageListResponse])
def list_pages(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    pages = (
        db.query(Page)
        .filter(Page.user_id == current_user["id"])
        .order_by(Page.created_at.desc())
        .all()
    )
    return pages


@router.get("/{page_id}", response_model=PageResponse)
def get_page(
    page_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    page = (
        db.query(Page)
        .filter(Page.id == page_id, Page.user_id == current_user["id"])
        .first()
    )
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


@router.delete("/{page_id}")
def delete_page(
    page_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    page = (
        db.query(Page)
        .filter(Page.id == page_id, Page.user_id == current_user["id"])
        .first()
    )
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    db.delete(page)
    db.commit()
    return {"message": "Page deleted"}
