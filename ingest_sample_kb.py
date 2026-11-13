from pathlib import Path
from app.core.config import get_settings
from app.services.ingestion import load_file, chunk_documents
from app.rag.vectorstore import add_documents

# Load central application settings
settings = get_settings()


def main():
    """Ingest local sample knowledge base documents into the Pinecone vector database."""
    folder = Path(settings.sample_kb_dir)
    if not folder.exists():
        print(f"Error: Sample KB directory does not exist at {folder}")
        return

    files = [p for p in folder.iterdir() if p.is_file()]
    if not files:
        print(f"Warning: No files found to ingest in {folder}")
        return

    all_docs = []
    # Load and parse each sample document
    for path in files:
        print(f"Loading: {path.name}")
        all_docs.extend(load_file(path))

    # Split documents into overlapping chunks
    chunks = chunk_documents(all_docs)
    print(f"Created {len(chunks)} chunks from {len(files)} files.")

    # Embed and upload vectors to Pinecone
    print(f"Uploading vectors to Pinecone index '{settings.pinecone_index_name}'...")
    ids = add_documents(chunks)
    print(f"Successfully indexed {len(files)} files -> {len(chunks)} chunks -> {len(ids)} Pinecone vectors.")


if __name__ == "__main__":
    main()
