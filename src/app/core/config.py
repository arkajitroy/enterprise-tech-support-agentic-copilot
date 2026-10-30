"""
Application configuration — loads and validates environment variables.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM
    groq_api_key: str = ""
    groq_ai_model: str = "llama3-8b-8192"

    # Vector DB
    pinecone_api_key: str = ""
    pinecone_index_name: str = "enterprise-tech-support-agentic-copilot"
    pinecone_namespace: str = "company-it-kb"

    # Search
    tavily_api_key: str = ""

    # Security
    admin_api_key: str = "change-me-in-production"

    # App
    app_env: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

