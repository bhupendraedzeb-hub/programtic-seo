from __future__ import annotations

from typing import Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from slugify import slugify
import uuid

from app.models import Page, Template
from app.services.template_service import render_template
from app.services.seo_service import evaluate_and_inject
from app.services.storage_service import StorageService
from app.utils.seo import word_count


def build_slug(value: str) -> str:
    slug = slugify(value, lowercase=True)
    return slug or "page"


def generate_page(
    db: Session,
    template: Template,
    user_id: str,
    variables: Dict[str, str],
    title: str,
    meta_description: str,
    slug: str | None,
    storage: StorageService,
    is_bulk: bool,
) -> Tuple[Page, str]:
    rendered = render_template(template.html_content, variables)

    base_slug = build_slug(slug or title)
    slug_value = base_slug

    robots = "noindex, nofollow" if is_bulk else "index, follow"

    for attempt in range(3):
        existing = (
            db.query(Page)
            .filter(Page.user_id == user_id, Page.slug == slug_value)
            .first()
        )
        if existing:
            slug_value = f"{base_slug}-{existing.id[:6]}"

        key = f"{user_id}/{slug_value}-{uuid.uuid4().hex}.html"
        canonical_url = storage.get_public_url(key)

        score, seo_data, html_with_meta = evaluate_and_inject(
            rendered,
            title=title,
            meta_description=meta_description,
            canonical_url=canonical_url,
            robots=robots,
        )

        storage.upload_html_with_key(key, html_with_meta)
        url = canonical_url
        wc = word_count(html_with_meta)

        page = Page(
            user_id=user_id,
            template_id=template.id,
            title=title,
            meta_description=meta_description,
            slug=slug_value,
            html_content=html_with_meta,
            storage_url=url,
            word_count=wc,
            seo_score=score,
            seo_data=seo_data,
            status="completed",
            is_bulk=is_bulk,
        )
        db.add(page)
        try:
            db.commit()
            db.refresh(page)
            return page, url
        except IntegrityError:
            db.rollback()
            slug_value = f"{base_slug}-{uuid.uuid4().hex[:6]}"

    # If we reach here, slug collisions are persistent.
    raise IntegrityError("Failed to persist page due to slug collisions.", params=None, orig=None)
