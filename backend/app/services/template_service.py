from __future__ import annotations

from typing import Dict, List
from jinja2 import Template, TemplateSyntaxError
from bs4 import BeautifulSoup
import bleach

from app.utils.template_parser import extract_variables


ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    "div",
    "section",
    "article",
    "header",
    "footer",
    "main",
    "nav",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "meta",
    "link",
    "style",
]

ALLOWED_ATTRS = {
    "*": ["class", "id", "style", "data-*"],
    "a": ["href", "title", "target", "rel"],
    "img": ["src", "alt", "title", "width", "height"],
    "meta": ["name", "content", "property"],
    "link": ["rel", "href"],
}


def sanitize_html(html: str) -> str:
    return bleach.clean(html or "", tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS)


def validate_html(html: str) -> Dict:
    issues: List[str] = []
    warnings: List[str] = []
    suggestions: List[str] = []

    soup = BeautifulSoup(html or "", "html.parser")

    if not soup.find("title"):
        issues.append("Template must include a <title> tag.")
    if not soup.find("meta", attrs={"name": "description"}):
        warnings.append("Meta description is recommended for SEO.")

    return {
        "issues": issues,
        "warnings": warnings,
        "suggestions": suggestions,
        "variables": extract_variables(html),
        "sanitized_html": sanitize_html(html),
    }


def _build_template_error_context(html: str, line_no: int, radius: int = 2) -> str:
    if not html or line_no <= 0:
        return ""
    lines = html.splitlines()
    index = line_no - 1
    start = max(index - radius, 0)
    end = min(index + radius + 1, len(lines))
    context = []
    for i in range(start, end):
        prefix = ">" if i == index else " "
        context.append(f"{prefix} {i + 1}: {lines[i]}")
    return "\n".join(context)


def render_template(html: str, variables: Dict[str, str]) -> str:
    try:
        template = Template(html)
        return template.render(**variables)
    except TemplateSyntaxError as exc:
        context = _build_template_error_context(html, exc.lineno or 0)
        message = "Template syntax error"
        if exc.lineno:
            message += f" at line {exc.lineno}"
        if exc.message:
            message += f": {exc.message}"
        if context:
            message += f"\n{context}"
        raise ValueError(message) from exc
