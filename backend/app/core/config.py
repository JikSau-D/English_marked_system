from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.

    NOTE: Keep defaults safe for local development; fail fast in code paths that
    require secrets (OCR / DeepSeek) if they are missing.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "University English Composition Grading & Evaluation Assistant"
    API_V1_STR: str = "/api"

    # Comma-separated list of allowed origins for CORS (frontend dev / prod).
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@db:5432/uecgea"

    JWT_SECRET_KEY: str = Field(default="CHANGE_ME", description="JWT signing key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 10

    # Baidu OCR (handwriting) credentials.
    BAIDU_OCR_API_KEY: str = ""
    BAIDU_OCR_SECRET_KEY: str = ""
    BAIDU_OCR_BASE_URL: str = "https://aip.baidubce.com"

    # DeepSeek (chat completion) credentials.
    DEEPSEEK_API_KEY: str = ""
    # Keep this compatible with OpenAI-style endpoints:
    # final URL will be: {DEEPSEEK_BASE_URL}/chat/completions
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_TIMEOUT_SECONDS: int = 120
    DEEPSEEK_TEMPERATURE: float = 0.2


settings = Settings()
