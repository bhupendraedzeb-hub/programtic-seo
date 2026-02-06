from .auth import router as auth_router
from .templates import router as templates_router
from .pages import router as pages_router
from .bulk import router as bulk_router
from .jobs import router as jobs_router

__all__ = [
    "auth_router",
    "templates_router",
    "pages_router",
    "bulk_router",
    "jobs_router",
]
