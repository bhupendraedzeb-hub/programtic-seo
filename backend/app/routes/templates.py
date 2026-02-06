import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models import Template, TemplateVariable
from app.schemas import (
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    TemplateListResponse,
    TemplateValidationRequest,
    TemplateValidationResponse,
)
from app.services.template_service import validate_html
from app.utils.seo import word_count

router = APIRouter()
logger = logging.getLogger("app.templates")


@router.post("/", response_model=TemplateResponse)
def create_template(
    payload: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    logger.info("create_template_start user=%s name=%s", current_user["id"], payload.name)
    validation = validate_html(payload.html_content)
    variables = validation["variables"]

    template = Template(
        user_id=current_user["id"],
        name=payload.name,
        html_content=payload.html_content,
        variables=variables,
        seo_checks={},
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    for var in variables:
        db.add(TemplateVariable(template_id=template.id, name=var, required=True))
    db.commit()

    logger.info("create_template_success user=%s template_id=%s", current_user["id"], template.id)
    return template


@router.get("/", response_model=List[TemplateListResponse])
def list_templates(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return (
        db.query(Template)
        .filter(Template.user_id == current_user["id"])
        .order_by(Template.created_at.desc())
        .all()
    )


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.user_id == current_user["id"])
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: str,
    payload: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.user_id == current_user["id"])
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    if payload.name is not None:
        template.name = payload.name
    if payload.html_content is not None:
        template.html_content = payload.html_content
        validation = validate_html(payload.html_content)
        template.variables = validation["variables"]
        db.query(TemplateVariable).filter(TemplateVariable.template_id == template.id).delete()
        for var in template.variables:
            db.add(TemplateVariable(template_id=template.id, name=var, required=True))

    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}")
def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.user_id == current_user["id"])
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    db.delete(template)
    db.commit()
    return {"message": "Template deleted"}


@router.post("/validate", response_model=TemplateValidationResponse)
def validate_template(
    payload: TemplateValidationRequest,
):
    result = validate_html(payload.html_content)
    return TemplateValidationResponse(
        variables=result["variables"],
        word_count=word_count(payload.html_content),
        issues=result["issues"],
        warnings=result["warnings"],
        suggestions=result["suggestions"],
        sanitized_html=result["sanitized_html"],
    )


@router.post("/{template_id}/validate", response_model=TemplateValidationResponse)
def validate_saved_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.user_id == current_user["id"])
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    result = validate_html(template.html_content)
    return TemplateValidationResponse(
        variables=result["variables"],
        word_count=word_count(template.html_content),
        issues=result["issues"],
        warnings=result["warnings"],
        suggestions=result["suggestions"],
        sanitized_html=result["sanitized_html"],
    )
