import logging
from pathlib import Path
from typing import Literal
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from app.core.config import get_settings
from app.rag.state import AgentState, RouteDecision, EvidenceGrade
from app.rag.vectorstore import get_retriever

# Set up logger and central application settings
logger = logging.getLogger(__name__)
settings = get_settings()

_llm = None
_web_search = None


def llm():
    """Initialize and return the configured LLM provider instance (Groq or OpenAI)."""
    global _llm
    if _llm is None:
        if settings.groq_api_key:
            _llm = ChatGroq(
                model=settings.groq_model,
                temperature=0,
                api_key=settings.groq_api_key,
            )
        elif settings.openai_api_key:
            _llm = ChatOpenAI(
                model=settings.openai_model,
                temperature=0,
                api_key=settings.openai_api_key,
            )
        else:
            raise RuntimeError("Either GROQ_API_KEY or OPENAI_API_KEY must be provided")
    return _llm


def web_search_tool():
    """Initialize and return the Tavily web search tool instance."""
    global _web_search
    if _web_search is None:
        if not settings.tavily_api_key:
            raise RuntimeError("TAVILY_API_KEY is missing from environment variables")
        _web_search = TavilySearch(
            tavily_api_key=settings.tavily_api_key,
            max_results=5,
            topic="general",
            include_answer=True,
            include_raw_content=False,
        )
    return _web_search


def add_trace(state: AgentState, message: str) -> list[str]:
    """Append a step summary message to the execution trace list for UI visualization."""
    return [*state.get("trace", []), message]


def route_question(state: AgentState):
    """Classify the incoming question as requiring private knowledge ('kb') or casual chat ('direct')."""
    try:
        router = llm().with_structured_output(RouteDecision, method="json_mode")
        decision = router.invoke([
            SystemMessage(
                content="You route messages for an enterprise IT support assistant. "
                "Return JSON with format {\"route\": \"kb\"} or {\"route\": \"direct\"}. "
                "Use 'kb' for IT policies, VPN, password reset, MFA, hardware, software, devices, network, security, or troubleshooting. "
                "Use 'direct' only for greetings, thanks, or casual conversation. DO NOT answer the question."
            ),
            HumanMessage(content=f"Question: {state['question']}"),
        ])
        route = decision.route if isinstance(decision, RouteDecision) else decision.get("route", "kb")
    except Exception as err:
        logger.warning("Router classification failed, defaulting to 'kb': %s", err)
        route = "kb"
    return {"source_used": route, "trace": add_trace(state, f"Router → {route.upper()}")}


def route_after_router(state: AgentState) -> Literal["retrieve_kb", "direct_answer"]:
    """Determine the next step after routing: search knowledge base or output direct greeting."""
    return "retrieve_kb" if state["source_used"] == "kb" else "direct_answer"


def retrieve_kb(state: AgentState):
    """Retrieve top-k relevant chunks from the private Pinecone knowledge base."""
    docs = get_retriever().invoke(state["current_query"])
    return {"kb_docs": docs, "trace": add_trace(state, f"Private KB retrieval → {len(docs)} chunks")}


def grade_kb(state: AgentState):
    """Evaluate whether the retrieved private company documents are sufficient to answer the question."""
    if not state.get("kb_docs"):
        return {"kb_grade": "weak", "trace": add_trace(state, "KB evidence grade → WEAK (no documents)")}

    context = "\n\n".join(
        f"Source: {Path(d.metadata.get('source', 'unknown')).name}\n{d.page_content}"
        for d in state["kb_docs"]
    )
    try:
        grader = llm().with_structured_output(EvidenceGrade, method="json_mode")
        result = grader.invoke([
            SystemMessage(
                content="You grade evidence sufficiency for an enterprise IT support assistant. "
                "Return JSON with format {\"grade\": \"good\"} or {\"grade\": \"weak\"}. "
                "Return 'good' only if the private KB evidence contains specific and sufficient details to answer the user question. "
                "Otherwise return 'weak'. DO NOT answer the question."
            ),
            HumanMessage(content=f"User Question: {state['question']}\n\nPrivate Evidence:\n{context}"),
        ])
        grade = result.grade if isinstance(result, EvidenceGrade) else result.get("grade", "weak")
    except Exception as err:
        logger.warning("KB grading failed, fallback to 'good' if docs exist: %s", err)
        grade = "good" if len(state["kb_docs"]) > 0 else "weak"

    return {"kb_grade": grade, "trace": add_trace(state, f"KB evidence grade → {grade.upper()}")}


def after_kb(state: AgentState) -> Literal["generate_from_kb", "search_web"]:
    """Branch to answer generation if private KB evidence is good, or fall back to web search if weak."""
    return "generate_from_kb" if state["kb_grade"] == "good" else "search_web"


def search_web(state: AgentState):
    """Execute external Tavily web search when private company documents lack necessary answers."""
    result = web_search_tool().invoke({"query": state["current_query"]})
    lines, citations = [], []
    if isinstance(result, dict):
        if result.get("answer"):
            lines.append("Search answer: " + result["answer"])
        for item in result.get("results", []):
            title = item.get("title", "")
            url = item.get("url", "")
            content = item.get("content", "")
            lines.append(f"Title: {title}\nURL: {url}\nContent: {content}")
            citations.append({"title": title or url, "url": url, "type": "web"})
    else:
        lines.append(str(result))

    return {
        "web_results": "\n\n".join(lines),
        "citations": citations,
        "source_used": "web",
        "trace": add_trace(state, "Web fallback → Tavily search"),
    }


def grade_web(state: AgentState):
    """Evaluate whether the retrieved external web search results are sufficient to answer."""
    web_text = state.get("web_results", "").strip()
    if not web_text:
        return {"web_grade": "weak", "trace": add_trace(state, "Web evidence grade → WEAK (no results)")}

    try:
        grader = llm().with_structured_output(EvidenceGrade, method="json_mode")
        result = grader.invoke([
            SystemMessage(
                content="You evaluate web search results for an IT query. "
                "Return JSON with format {\"grade\": \"good\"} or {\"grade\": \"weak\"}. "
                "Return 'good' if the search results contain relevant information answering the question, else 'weak'. "
                "DO NOT answer the question itself."
            ),
            HumanMessage(content=f"User Question: {state['question']}\n\nWeb Evidence:\n{web_text[:3500]}"),
        ])
        grade = result.grade if isinstance(result, EvidenceGrade) else result.get("grade", "weak")
    except Exception as err:
        logger.warning("Web grading failed, fallback to 'good': %s", err)
        grade = "good"

    return {"web_grade": grade, "trace": add_trace(state, f"Web evidence grade → {grade.upper()}")}


def after_web(state: AgentState) -> Literal["generate_from_web", "rewrite_query", "insufficient"]:
    """Decide whether to synthesize a web answer, rewrite the query to retry, or stop with insufficient evidence."""
    if state["web_grade"] == "good":
        return "generate_from_web"
    if state["retry_count"] < settings.max_retries:
        return "rewrite_query"
    return "insufficient"


def rewrite_query(state: AgentState):
    """Rewrite the user question using precise technical terminology to improve retrieval recall."""
    rewritten = llm().invoke(f"""
Rewrite this IT support question for better private knowledge retrieval and vendor web search.
Preserve intent, add useful technical keywords, do not answer, return only the rewritten query.
Question: {state['question']}
""").content.strip()
    return {
        "current_query": rewritten,
        "retry_count": state["retry_count"] + 1,
        "trace": add_trace(state, f"Query rewrite → {rewritten}"),
    }


def generate_from_kb(state: AgentState):
    """Generate a trusted response grounded strictly in the company's internal IT knowledge base."""
    context = "\n\n".join(
        f"[Source: {Path(d.metadata.get('source', 'unknown')).name}]\n{d.page_content}"
        for d in state["kb_docs"]
    )
    answer = llm().invoke(f"""
You are an enterprise IT support copilot. Answer ONLY from the private company KB below.
Be concise, actionable, and safe. If steps are present, present them clearly.
Do not invent policy details. Mention that the answer is based on the company's private knowledge base.
Question: {state['question']}\n\nPrivate KB:\n{context}
""").content

    citations = []
    seen = set()
    for d in state["kb_docs"]:
        src = d.metadata.get("source", "Private KB")
        filename = Path(src).name if src else "Private KB"
        if filename not in seen:
            seen.add(filename)
            citations.append({"title": filename, "url": "", "type": "private_kb"})

    return {
        "answer": answer,
        "source_used": "private_kb",
        "citations": citations,
        "trace": add_trace(state, "Answer generation → PRIVATE KB"),
    }


def generate_from_web(state: AgentState):
    """Synthesize an answer from external search results accompanied by an IT verification notice."""
    answer = llm().invoke(f"""
You are an enterprise IT support copilot. The private company KB was insufficient.
Answer ONLY from the web evidence below. Clearly say this is external web information and may need IT validation before changing company-managed systems.
Question: {state['question']}\n\nWeb evidence:\n{state['web_results']}
""").content

    return {
        "answer": answer,
        "source_used": "web_search",
        "trace": add_trace(state, "Answer generation → WEB SEARCH"),
    }


def direct_answer(state: AgentState):
    """Provide a direct conversational reply for greetings and general non-IT queries."""
    answer = llm().invoke(f"Respond briefly and naturally to: {state['question']}").content
    return {"answer": answer, "source_used": "direct", "trace": add_trace(state, "Direct response → no retrieval")}


def insufficient(state: AgentState):
    """Provide a standard fallback response when no reliable information could be located."""
    return {
        "answer": "I couldn't find enough reliable evidence in the company knowledge base or external search to answer confidently. Please contact the IT help desk or provide more details.",
        "source_used": "insufficient_evidence",
        "trace": add_trace(state, "Stopped → insufficient reliable evidence"),
    }


def build_graph():
    """Build and compile the complete state graph with routing and fallback logic."""
    graph = StateGraph(AgentState)
    for name, fn in {
        "route_question": route_question,
        "retrieve_kb": retrieve_kb,
        "grade_kb": grade_kb,
        "search_web": search_web,
        "grade_web": grade_web,
        "rewrite_query": rewrite_query,
        "generate_from_kb": generate_from_kb,
        "generate_from_web": generate_from_web,
        "direct_answer": direct_answer,
        "insufficient": insufficient,
    }.items():
        graph.add_node(name, fn)

    graph.add_edge(START, "route_question")
    graph.add_conditional_edges("route_question", route_after_router, {
        "retrieve_kb": "retrieve_kb", "direct_answer": "direct_answer"
    })
    graph.add_edge("retrieve_kb", "grade_kb")
    graph.add_conditional_edges("grade_kb", after_kb, {
        "generate_from_kb": "generate_from_kb", "search_web": "search_web"
    })
    graph.add_edge("search_web", "grade_web")
    graph.add_conditional_edges("grade_web", after_web, {
        "generate_from_web": "generate_from_web", "rewrite_query": "rewrite_query", "insufficient": "insufficient"
    })
    graph.add_edge("rewrite_query", "retrieve_kb")
    graph.add_edge("generate_from_kb", END)
    graph.add_edge("generate_from_web", END)
    graph.add_edge("direct_answer", END)
    graph.add_edge("insufficient", END)
    return graph.compile()


# Compile the LangGraph agent graph at application startup
agent_graph = build_graph()


def ask(question: str):
    """Execute the Agentic RAG workflow for a given query and return the resulting state."""
    initial: AgentState = {
        "question": question,
        "current_query": question,
        "kb_docs": [],
        "web_results": "",
        "kb_grade": "",
        "web_grade": "",
        "answer": "",
        "source_used": "",
        "retry_count": 0,
        "trace": [],
        "citations": [],
    }
    return agent_graph.invoke(initial)
