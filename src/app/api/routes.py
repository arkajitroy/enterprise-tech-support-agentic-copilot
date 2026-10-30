"""
API Routes — Chat, Health, and Ingestion endpoints.
Implement route handlers here.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@router.post("/chat")
async def chat():
    """Chat endpoint — wire up LangGraph workflow here."""
    raise NotImplementedError("Chat endpoint not yet implemented.")


@router.post("/ingest")
async def ingest():
    """Document ingestion endpoint — protected by X-Admin-Key header."""
    raise NotImplementedError("Ingest endpoint not yet implemented.")

