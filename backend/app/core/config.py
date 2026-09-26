"""Application Configuration settings using Pydantic Settings."""


from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings loaded from environment variables and .env file."""

    # Application & Environment
    PROJECT_NAME: str = "FINCLOSURE"
    VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    API_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Groq AI & Document Intelligence
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    PROCESSING_TIMEOUT_SECONDS: int = 120

    # Firebase Configuration (Validated on initialization)
    FIREBASE_PROJECT_ID: str | None = None
    FIREBASE_STORAGE_BUCKET: str | None = None
    FIREBASE_CREDENTIALS_PATH: str | None = None
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None

    # Document Intake Configuration
    MAX_DOCUMENT_SIZE_MB: int = 20
    ALLOWED_DOCUMENT_EXTENSIONS: list[str] = [".pdf", ".jpeg", ".jpg", ".png"]
    ALLOWED_DOCUMENT_MIME_TYPES: list[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()
