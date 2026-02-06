from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    email: EmailStr


class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    html_content: str = Field(..., min_length=20)


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    html_content: Optional[str] = None


class TemplateResponse(BaseModel):
    id: str
    user_id: str
    name: str
    html_content: str
    variables: List[str]
    seo_checks: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    id: str
    name: str
    variables: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PageCreate(BaseModel):
    template_id: str
    variables: Dict[str, str]
    title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None


class PageResponse(BaseModel):
    id: str
    user_id: str
    template_id: Optional[str]
    title: str
    meta_description: str
    slug: str
    storage_url: str
    word_count: int
    seo_score: int
    seo_data: Dict[str, Any]
    status: str
    is_bulk: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PageListResponse(BaseModel):
    id: str
    title: str
    slug: str
    seo_score: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TemplateValidationRequest(BaseModel):
    html_content: str = Field(..., min_length=20)


class TemplateValidationResponse(BaseModel):
    variables: List[str]
    word_count: int
    issues: List[str]
    warnings: List[str]
    suggestions: List[str]
    sanitized_html: str


class SingleRenderResponse(BaseModel):
    html_content: str
    storage_url: str
    seo_score: int
    word_count: int


class BulkJobResponse(BaseModel):
    id: str
    user_id: str
    template_id: Optional[str]
    csv_filename: Optional[str]
    total_rows: int
    processed_rows: int
    failed_rows: int
    status: str
    result_urls: List[Dict[str, Any]]
    errors: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BulkJobListResponse(BaseModel):
    id: str
    csv_filename: Optional[str]
    total_rows: int
    processed_rows: int
    failed_rows: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
