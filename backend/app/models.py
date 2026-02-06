from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Integer,
    ForeignKey,
    JSON,
    Boolean,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone
import uuid

Base = declarative_base()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Template(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    html_content = Column(Text, nullable=False)
    variables = Column(JSON, default=list)
    seo_checks = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    template_variables = relationship(
        "TemplateVariable",
        back_populates="template",
        cascade="all, delete-orphan",
    )
    pages = relationship("Page", back_populates="template")
    bulk_jobs = relationship("BulkJob", back_populates="template")

    __table_args__ = (Index("idx_templates_user_id", "user_id"),)


class TemplateVariable(Base):
    __tablename__ = "template_variables"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(String, ForeignKey("templates.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    required = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    template = relationship("Template", back_populates="template_variables")

    __table_args__ = (
        UniqueConstraint("template_id", "name", name="uq_template_variable_name"),
    )


class Page(Base):
    __tablename__ = "pages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    template_id = Column(String, ForeignKey("templates.id"))
    title = Column(String(255), nullable=False)
    meta_description = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, index=True)
    html_content = Column(Text, nullable=False)
    storage_url = Column(String(500), nullable=False)
    word_count = Column(Integer, default=0)
    seo_score = Column(Integer, default=0)
    seo_data = Column(JSON, default=dict)
    status = Column(String(50), default="active")
    is_bulk = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    template = relationship("Template", back_populates="pages")

    __table_args__ = (
        Index("idx_pages_user_id", "user_id"),
        Index("idx_pages_slug", "slug"),
        UniqueConstraint("user_id", "slug", name="uq_user_slug"),
    )


class BulkJob(Base):
    __tablename__ = "bulk_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    template_id = Column(String, ForeignKey("templates.id"))
    csv_filename = Column(String(255))
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    status = Column(String(50), default="queued")
    result_urls = Column(JSON, default=list)
    errors = Column(JSON, default=list)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    template = relationship("Template", back_populates="bulk_jobs")

    __table_args__ = (
        Index("idx_bulk_jobs_user_id", "user_id"),
        Index("idx_bulk_jobs_status", "status"),
    )
