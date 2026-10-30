"""
One-shot script — ingest sample KB documents into Pinecone.
Usage: python ingest_sample_kb.py
"""
import sys
from pathlib import Path

# Allow running from the project root without installing the package
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app.services.ingestion import ingest_directory  # noqa: E402

SAMPLE_KB_DIR = Path(__file__).parent / "src" / "data" / "sample_kb"


def main() -> None:
    print(f"Ingesting documents from: {SAMPLE_KB_DIR}")
    results = ingest_directory(SAMPLE_KB_DIR)
    if not results:
        print("No documents found in the sample KB directory.")
        return
    for filename, chunk_count in results.items():
        print(f"  ✔ {filename} → {chunk_count} chunks ingested")
    print("Done.")


if __name__ == "__main__":
    main()

