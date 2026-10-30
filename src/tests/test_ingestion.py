"""
Tests for the document ingestion service.
"""
import pytest
from pathlib import Path


def test_supported_extensions():
    from app.services.ingestion import SUPPORTED_EXTENSIONS

    assert ".pdf" in SUPPORTED_EXTENSIONS
    assert ".txt" in SUPPORTED_EXTENSIONS
    assert ".md" in SUPPORTED_EXTENSIONS
    assert ".docx" in SUPPORTED_EXTENSIONS


def test_ingest_unsupported_raises(tmp_path):
    from app.services.ingestion import ingest_file

    bad_file = tmp_path / "bad.csv"
    bad_file.write_text("a,b,c")
    with pytest.raises(ValueError, match="Unsupported file type"):
        ingest_file(bad_file)

