import logging
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.dependencies import init_db
from app.routes import auth_router, templates_router, pages_router, bulk_router, jobs_router

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("app")

app = FastAPI(title=settings.app_name, debug=settings.debug)

origins = {o.strip() for o in settings.allowed_origins.split(",") if o.strip()}
origins.update({"http://localhost:3000", "http://127.0.0.1:3000"})
origins = list(origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    logger.info(
        "startup pid=%s app_file=%s cwd=%s",
        os.getpid(),
        Path(__file__).resolve(),
        Path.cwd(),
    )
    init_db()


@app.get("/api/health")
def health():
    logger.info("health_check")
    return {"status": "ok"}


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(templates_router, prefix="/api/templates", tags=["templates"])
app.include_router(pages_router, prefix="/api/pages", tags=["pages"])
app.include_router(bulk_router, prefix="/api/bulk", tags=["bulk"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["jobs"])
