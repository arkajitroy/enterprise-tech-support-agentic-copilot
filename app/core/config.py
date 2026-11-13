from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory representing the root folder of the project
BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Central configuration class loading environment variables and runtime settings."""

    # Application details and environment
    app_name: str = "Enterprise IT Support Agentic RAG Copilot"
    app_env: str = "development"

    # Groq API configuration (Free, fast LLM inference)
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"

    # OpenAI API configuration (Optional fallback provider)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Pinecone vector database configuration
    pinecone_api_key: str = ""
    pinecone_index_name: str = "fde-it-support-rag"
    pinecone_namespace: str = "company-it-kb"

    # Embedding model name (all-MiniLM-L6-v2 for local 384d, or text-embedding-3-small for OpenAI)
    embedding_model: str = "all-MiniLM-L6-v2"

    # Tavily web search API key for external fallbacks
    tavily_api_key: str = ""

    # RAG retrieval and retry parameters
    top_k: int = 4
    max_retries: int = 1

    # Security key for admin ingestion endpoint
    admin_api_key: str = "change-me"

    # Local file and database paths
    audit_db_path: str = str(BASE_DIR / "data" / "audit.db")
    upload_dir: str = str(BASE_DIR / "uploads")
    sample_kb_dir: str = str(BASE_DIR / "data" / "sample_kb")

    # Load configurations automatically from the root .env file
    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"), extra="ignore")


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton instance of application settings."""
    return Settings()
