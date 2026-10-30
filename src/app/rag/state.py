"""
LangGraph state definition — typed state + structured decision objects
for the Agentic RAG workflow.
"""
from __future__ import annotations

from typing import Annotated, Literal, TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """Shared state passed between every node in the RAG graph."""

    # Conversation history (auto-merged by LangGraph)
    messages: Annotated[list, add_messages]

    # Current question being processed
    question: str

    # Retrieved document chunks
    documents: list[str]

    # Routing decision: "kb" | "direct"
    route: Literal["kb", "direct"]

    # Evidence quality: "good" | "weak"
    evidence_grade: Literal["good", "weak"]

    # Source used for the final answer
    source_used: Literal["private_kb", "web", "none", "direct"]

    # Decision trace for transparency / debugging
    trace: list[str]

    # Number of query-rewrite retries
    retry_count: int

    # Final answer text
    answer: str

