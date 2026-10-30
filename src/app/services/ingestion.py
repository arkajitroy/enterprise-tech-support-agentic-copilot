"""
Document ingestion service — loads PDF/TXT/MD/DOCX files,
chunks them, embeds them, and upserts into Pinecone.
"""
from __future__ import annotations

from pathlib import Path

from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
    Docx2txtLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.logging import get_logger
from app.rag.vectorstore import get_vectorstore

logger = get_logger(__name__)

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}

_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)


def _load_file(path: Path):
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return PyPDFLoader(str(path)).load()
    if suffix == ".txt":
        return TextLoader(str(path)).load()
    if suffix == ".md":
        return UnstructuredMarkdownLoader(str(path)).load()
    if suffix == ".docx":
        return Docx2txtLoader(str(path)).load()
    raise ValueError(f"Unsupported file type: {suffix}")


def ingest_file(path: Path) -> int:
    """
    Load, chunk, embed, and upsert a single document into Pinecone.
    Returns the number of chunks ingested.
    """
    if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {path.suffix}")

    logger.info("Loading document: %s", path.name)
    docs = _load_file(path)
    chunks = _splitter.split_documents(docs)
    logger.info("Upserting %d chunks for '%s'…", len(chunks), path.name)
    get_vectorstore().add_documents(chunks)
    return len(chunks)


def ingest_directory(directory: Path) -> dict[str, int]:
    """Ingest all supported documents in a directory. Returns {filename: chunk_count}."""
    results: dict[str, int] = {}
    for file in sorted(directory.iterdir()):
        if file.is_file() and file.suffix.lower() in SUPPORTED_EXTENSIONS:
            try:
                results[file.name] = ingest_file(file)
            except Exception as exc:
                logger.error("Failed to ingest '%s': %s", file.name, exc)
    return results

