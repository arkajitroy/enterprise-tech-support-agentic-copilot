"""
Pinecone vector store + HuggingFace embedding initialization.
"""
from __future__ import annotations

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_embeddings: HuggingFaceEmbeddings | None = None
_vectorstore: PineconeVectorStore | None = None


def get_embeddings() -> HuggingFaceEmbeddings:
    """Return a cached HuggingFace embedding model (all-MiniLM-L6-v2)."""
    global _embeddings
    if _embeddings is None:
        logger.info("Loading HuggingFace embeddings model…")
        _embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embeddings


def get_vectorstore() -> PineconeVectorStore:
    """Return a cached Pinecone vector store client."""
    global _vectorstore
    if _vectorstore is None:
        logger.info("Connecting to Pinecone index '%s'…", settings.pinecone_index_name)
        _vectorstore = PineconeVectorStore(
            index_name=settings.pinecone_index_name,
            embedding=get_embeddings(),
            namespace=settings.pinecone_namespace,
            pinecone_api_key=settings.pinecone_api_key,
        )
    return _vectorstore

