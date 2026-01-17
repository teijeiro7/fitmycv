from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Allow extra fields in .env without errors
    )

    # Database
    DATABASE_URL: str = "postgresql://fitmycv:fitmycv123@localhost:5432/fitmycv"

    # JWT
    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OAuth Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # OAuth GitHub
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/auth/callback/github"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # AI Provider - OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"

    # AI Provider - Anthropic (Claude)
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"

    # AI Provider - OpenRouter (Free Models Available)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "google/gemini-2.0-flash-exp:free"
    # Other free models:
    # - "google/gemini-2.0-flash-exp:free" (Best for CV adaptation)
    # - "meta-llama/llama-3.3-70b-instruct:free"
    # - "mistralai/mistral-7b-instruct:free"
    # - "microsoft/phi-3-mini-128k-instruct:free"
    OPENROUTER_SITE_URL: str = "http://localhost:5173"  # Your app URL
    OPENROUTER_APP_NAME: str = "FitMyCV"

    # Default AI provider (openai, anthropic, or openrouter)
    AI_PROVIDER: str = "openrouter"

    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_EXTENSIONS: List[str] = [".docx", ".pdf", ".doc"]

    # Templates
    TEMPLATES_DIR: str = "./app/templates"

    # Scraping
    SCRAPER_USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    SCRAPER_TIMEOUT: int = 30000  # 30 seconds

    @property
    def ai_api_key(self) -> str:
        """Get the appropriate API key based on provider"""
        if self.AI_PROVIDER == "anthropic":
            return self.ANTHROPIC_API_KEY
        elif self.AI_PROVIDER == "openrouter":
            return self.OPENROUTER_API_KEY
        return self.OPENAI_API_KEY

    @property
    def ai_model(self) -> str:
        """Get the appropriate model based on provider"""
        if self.AI_PROVIDER == "anthropic":
            return self.ANTHROPIC_MODEL
        elif self.AI_PROVIDER == "openrouter":
            return self.OPENROUTER_MODEL
        return self.OPENAI_MODEL

    @property
    def ai_base_url(self) -> Optional[str]:
        """Get the base URL for OpenRouter"""
        if self.AI_PROVIDER == "openrouter":
            return self.OPENROUTER_BASE_URL
        return None

settings = Settings()
