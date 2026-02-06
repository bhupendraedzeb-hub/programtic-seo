from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from jose import jwt, JWTError
from datetime import datetime, timezone
from typing import Generator

from supabase import create_client, Client

from app.config import settings
from app.models import Base


# Database
engine_args = {
    "echo": settings.sql_echo,
    "pool_pre_ping": True,
}
if settings.database_url.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Supabase
supabase: Client | None = None
if settings.supabase_url and settings.supabase_service_key:
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)


# Auth
security = HTTPBearer(auto_error=True)


def verify_supabase_jwt(token: str) -> dict | None:
    if not settings.supabase_jwt_secret:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials

    # Try local JWT verification if secret is provided
    payload = verify_supabase_jwt(token)
    if payload and payload.get("sub"):
        return {
            "id": payload.get("sub"),
            "email": payload.get("email") or "",
            "role": payload.get("role") or "authenticated",
        }

    # Fallback to Supabase Auth API
    if supabase:
        try:
            auth_response = supabase.auth.get_user(token)
            user = auth_response.user
            return {
                "id": user.id,
                "email": user.email or "",
                "role": "authenticated",
            }
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired token: {str(exc)}",
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication failed",
    )


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
