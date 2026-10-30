"""
SQLite-based query audit — logs every decision path for transparency.
"""
from __future__ import annotations

import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path("audit.sqlite3")


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            ts        TEXT    NOT NULL,
            question  TEXT    NOT NULL,
            source    TEXT    NOT NULL,
            trace     TEXT    NOT NULL,
            answer    TEXT    NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def log_query(
    question: str,
    source_used: str,
    trace: list[str],
    answer: str,
) -> None:
    """Persist a completed query result to the audit log."""
    with _get_conn() as conn:
        conn.execute(
            "INSERT INTO audit_log (ts, question, source, trace, answer) VALUES (?,?,?,?,?)",
            (
                datetime.utcnow().isoformat(),
                question,
                source_used,
                " → ".join(trace),
                answer,
            ),
        )

