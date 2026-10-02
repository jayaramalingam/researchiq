"""
Application configuration — reads environment variables from .env via python-dotenv.

Usage:
    from app.core.config import settings

    api_key = settings.openrouter_api_key
"""
import os
from functools import lru_cache
from dotenv import load_dotenv

# Load from backend/.env (already done in main.py but safe to repeat)
load_dotenv()


class Settings:
    """Central settings object populated from environment variables."""

    # Database
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/researchiq",
    )

    # OpenRouter (AI)
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    openrouter_primary_model: str = os.getenv(
        "OPENROUTER_PRIMARY_MODEL",
        os.getenv("OPENROUTER_MODEL", "google/gemma-4-27b-it:free"),
    )
    openrouter_fallback_model: str = os.getenv(
        "OPENROUTER_FALLBACK_MODEL",
        "nvidia/nemotron-3.5-lightning:free",
    )
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_timeout_seconds: float = float(os.getenv("OPENROUTER_TIMEOUT", "60"))

    @property
    def openrouter_model(self) -> str:
        return self.openrouter_primary_model

    # Semantic Scholar (scholarly paper discovery)
    # The public paper-search endpoint works without a key but a key increases rate limits
    semantic_scholar_api_key: str = os.getenv("SEMANTIC_SCHOLAR_API_KEY", "")
    semantic_scholar_base_url: str = "https://api.semanticscholar.org/graph/v1"
    semantic_scholar_timeout_seconds: float = float(
        os.getenv("SEMANTIC_SCHOLAR_TIMEOUT", "20")
    )

    @property
    def ai_enabled(self) -> bool:
        return bool(self.openrouter_api_key)

    @property
    def semantic_scholar_headers(self) -> dict:
        headers: dict = {"Accept": "application/json"}
        if self.semantic_scholar_api_key:
            headers["x-api-key"] = self.semantic_scholar_api_key
        return headers


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
