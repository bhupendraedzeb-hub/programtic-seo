from __future__ import annotations

from supabase import Client
from typing import Optional
import uuid

from app.config import settings


class StorageService:
    def __init__(self, supabase: Optional[Client]):
        self.supabase = supabase
        self.bucket = settings.supabase_storage_bucket

    def get_public_url(self, key: str) -> str:
        if not self.supabase:
            raise ValueError("Supabase storage is not configured.")
        return self.supabase.storage.from_(self.bucket).get_public_url(key)

    def upload_html_with_key(self, key: str, html: str) -> None:
        if not self.supabase:
            raise ValueError("Supabase storage is not configured.")

        res = self.supabase.storage.from_(self.bucket).upload(
            key,
            html.encode("utf-8"),
            {"content-type": "text/html"},
        )
        # Supabase storage upload may return either a dict (older clients)
        # or an httpx.Response (storage3). Handle both safely.
        if isinstance(res, dict):
            if res.get("error"):
                raise ValueError(res["error"]["message"])
            return

        if hasattr(res, "is_success"):
            if not res.is_success:
                message = None
                try:
                    payload = res.json()
                    if isinstance(payload, dict):
                        message = payload.get("message") or payload.get("error")
                except Exception:
                    message = None
                if not message:
                    message = getattr(res, "text", None) or f"Upload failed with status {res.status_code}"
                raise ValueError(message)
            return

    def upload_html(self, user_id: str, html: str, slug: str) -> str:
        key = f"{user_id}/{slug}-{uuid.uuid4().hex}.html"
        self.upload_html_with_key(key, html)
        return self.get_public_url(key)

    def upload_bytes_with_key(self, key: str, data: bytes, content_type: str) -> None:
        if not self.supabase:
            raise ValueError("Supabase storage is not configured.")

        res = self.supabase.storage.from_(self.bucket).upload(
            key,
            data,
            {"content-type": content_type},
        )
        if isinstance(res, dict):
            if res.get("error"):
                raise ValueError(res["error"]["message"])
            return

        if hasattr(res, "is_success"):
            if not res.is_success:
                message = None
                try:
                    payload = res.json()
                    if isinstance(payload, dict):
                        message = payload.get("message") or payload.get("error")
                except Exception:
                    message = None
                if not message:
                    message = getattr(res, "text", None) or f"Upload failed with status {res.status_code}"
                raise ValueError(message)
