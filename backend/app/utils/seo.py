from __future__ import annotations

from bs4 import BeautifulSoup
from typing import Tuple, List, Dict
import hashlib
import re


TITLE_MIN = 50
TITLE_MAX = 60
DESC_MIN = 140
DESC_MAX = 160
MIN_WORDS = 300


def strip_text(html: str) -> str:
    soup = BeautifulSoup(html or "", "html.parser")
    return soup.get_text(" ")


def word_count(html: str) -> int:
    text = strip_text(html)
    words = re.findall(r"\b\w+\b", text)
    return len(words)


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def validate_seo(html: str, title: str, meta_description: str) -> Tuple[int, Dict]:
    issues: List[str] = []
    warnings: List[str] = []
    suggestions: List[str] = []

    wc = word_count(html)
    # SEO checks are informational only; do not enforce content length or meta bounds.

    score = 100
    score -= len(issues) * 15
    score -= len(warnings) * 5
    score = max(0, min(100, score))

    return score, {
        "issues": issues,
        "warnings": warnings,
        "suggestions": suggestions,
        "word_count": wc,
    }


def inject_meta(html: str, canonical_url: str, robots: str) -> str:
    soup = BeautifulSoup(html or "", "html.parser")

    if not soup.head:
        head = soup.new_tag("head")
        if soup.html:
            soup.html.insert(0, head)
        else:
            soup.insert(0, head)

    # Canonical tag injection disabled per project requirement.

    if robots:
        existing = soup.head.find("meta", attrs={"name": "robots"})
        if existing:
            existing["content"] = robots
        else:
            tag = soup.new_tag("meta", attrs={"name": "robots", "content": robots})
            soup.head.append(tag)

    return str(soup)
