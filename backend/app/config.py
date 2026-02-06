from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    app_name: str = "Programmatic SEO API"
    environment: str = "development"
    debug: bool = True

    database_url: str = "sqlite:///./test.db"
    sql_echo: bool = False

    supabase_url: str | None = None
    supabase_service_key: str | None = None
    supabase_jwt_secret: str | None = None
    supabase_storage_bucket: str = "generated-pages"

    redis_url: str = "redis://localhost:6379"
    allowed_origins: str = "http://localhost:3000"
    
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
