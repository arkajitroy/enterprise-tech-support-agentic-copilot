from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from pydantic import BaseModel, Field
from app.core.config import get_settings
from app.rag.workflow import ask
from app.rag.vectorstore import add_documents
from app.services.ingestion import load_file, chunk_documents, SUPPORTED
from app.services.audit import write_audit

# Initialize API router and application settings
router = APIRouter(prefix="/api")
settings = get_settings()


class ChatRequest(BaseModel):
    """Schema validating chat requests submitted to the IT support assistant."""

    question: str = Field(min_length=2, max_length=3000, description="The user query or IT problem description")


@router.get("/health")
def health():
    """Return system status and application details for health checks."""
    return {"status": "ok", "service": settings.app_name}


@router.post("/chat")
def chat(payload: ChatRequest):
    """Execute the Agentic RAG workflow for a user question and store audit logs."""
    try:
        result = ask(payload.question)
        write_audit(payload.question, result["source_used"], result.get("trace", []))

        return {
            "answer": result["answer"],
            "source_used": result["source_used"],
            "trace": result.get("trace", []),
            "citations": result.get("citations", []),
            "rewritten_query": result.get("current_query", payload.question),
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/ingest")
async def ingest(file: UploadFile = File(...), x_admin_key: str = Header(default="")):
    """Securely upload, process, and index new company documentation into the Pinecone vector database."""
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Invalid admin key")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED:
        raise HTTPException(status_code=400, detail=f"Supported file types: {', '.join(sorted(SUPPORTED))}")

    # Persist the uploaded file to disk
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / Path(file.filename).name
    dest.write_bytes(await file.read())

    # Load, chunk, and index into Pinecone
    docs = load_file(dest)
    chunks = chunk_documents(docs)
    ids = add_documents(chunks)

    return {"message": "Document indexed", "file": dest.name, "chunks": len(chunks), "ids_created": len(ids)}
