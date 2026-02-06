from __future__ import annotations

from app.utils.seo import validate_seo, inject_meta


def evaluate_and_inject(html: str, title: str, meta_description: str, canonical_url: str, robots: str):
    score, details = validate_seo(html, title, meta_description)
    updated = inject_meta(html, canonical_url=canonical_url, robots=robots)
    return score, details, updated
