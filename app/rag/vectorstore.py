import time
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from app.core.config import get_settings

# Load application settings
settings = get_settings()

_embeddings = None
_vectorstore = None

# Known embedding model dimension mappings
EMBEDDING_DIMENSIONS = {
    "all-minilm-l6-v2": 384,
    "sentence-transformers/all-minilm-l6-v2": 384,
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072,
    "text-embedding-ada-002": 1536,
}


def get_embedding_dimension(model_name: str | None = None) -> int:
    """Determine the vector dimension required for the specified embedding model."""
    name = (model_name or settings.embedding_model or "").strip().lower()
    if not name:
        raise RuntimeError("Embedding model is not configured")

    if name in EMBEDDING_DIMENSIONS:
        return EMBEDDING_DIMENSIONS[name]
    if "minilm" in name:
        return 384
    if "text-embedding-3-small" in name or "ada-002" in name:
        return 1536
    if "text-embedding-3-large" in name:
        return 3072

    raise ValueError(
        f"Unsupported embedding model '{model_name or settings.embedding_model}' for Pinecone. "
        "Add the matching dimension to EMBEDDING_DIMENSIONS."
    )


def get_embeddings():
    """Initialize and return the appropriate embedding model (FastEmbed local or OpenAI)."""
    global _embeddings
    if _embeddings is None:
        model_name = (settings.embedding_model or "").strip().lower()
        # Use local FastEmbed model if configured or if no OpenAI key is available
        if "minilm" in model_name or not settings.openai_api_key:
            _embeddings = FastEmbedEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        else:
            _embeddings = OpenAIEmbeddings(
                model=settings.embedding_model,
                api_key=settings.openai_api_key,
            )
    return _embeddings


def ensure_index():
    """Ensure the Pinecone index exists with the matching vector dimension, creating it if needed."""
    if not settings.pinecone_api_key:
        raise RuntimeError("PINECONE_API_KEY is missing from environment variables")

    desired_dimension = get_embedding_dimension()
    pc = Pinecone(api_key=settings.pinecone_api_key)

    # Safely retrieve all index names from Pinecone
    existing_indexes = pc.list_indexes()
    names = [getattr(idx, "name", idx["name"] if isinstance(idx, dict) else str(idx)) for idx in existing_indexes]

    # Recreate index if it exists with an incompatible dimension
    if settings.pinecone_index_name in names:
        index_info = pc.describe_index(settings.pinecone_index_name)
        current_dim = getattr(index_info, "dimension", None)
        if current_dim is None and isinstance(index_info, dict):
            current_dim = index_info.get("dimension")

        if current_dim is not None and current_dim != desired_dimension:
            pc.delete_index(name=settings.pinecone_index_name)
            while settings.pinecone_index_name in [getattr(x, "name", x["name"] if isinstance(x, dict) else str(x)) for x in pc.list_indexes()]:
                time.sleep(1)

    # Create index if it does not exist
    current_names = [getattr(idx, "name", idx["name"] if isinstance(idx, dict) else str(idx)) for idx in pc.list_indexes()]
    if settings.pinecone_index_name not in current_names:
        pc.create_index(
            name=settings.pinecone_index_name,
            dimension=desired_dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        while not pc.describe_index(settings.pinecone_index_name).status["ready"]:
            time.sleep(1)

    return pc.Index(settings.pinecone_index_name)


def get_vectorstore():
    """Initialize and return the singleton PineconeVectorStore instance."""
    global _vectorstore
    if _vectorstore is None:
        index = ensure_index()
        _vectorstore = PineconeVectorStore(
            index=index,
            embedding=get_embeddings(),
            namespace=settings.pinecone_namespace,
        )
    return _vectorstore


def get_retriever():
    """Return a LangChain vector store retriever configured with the top_k parameter."""
    return get_vectorstore().as_retriever(search_kwargs={"k": settings.top_k})


def add_documents(chunks):
    """Add chunked document objects into Pinecone and return their generated vector IDs."""
    store = get_vectorstore()
    return store.add_documents(chunks)
