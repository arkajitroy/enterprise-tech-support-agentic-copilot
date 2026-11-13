# Enterprise IT Support Agentic RAG Copilot — Setup & Running Guide

This guide provides end-to-end instructions for running the Enterprise IT Support Agentic RAG Copilot using **uv**, **Groq** (LLM inference), **Pinecone** (Vector DB), **FastEmbed** (`all-MiniLM-L6-v2` local embeddings), and **Tavily** (external web search fallback).

---

## 1. Prerequisites

- **Python 3.10+** (Python 3.12 recommended; `uv` downloads and manages Python automatically)
- **uv** (ultra-fast Python package and environment manager)

---

## 2. Environment Configuration (`.env`)

Check your `.env` file in the project root directory. It contains the following configuration keys:

```env
# Application Environment
APP_NAME="Enterprise IT Support Agentic RAG Copilot"
APP_ENV=development

# Groq API Configuration (Free, fast LLM inference: https://console.groq.com)
GROQ_API_KEY="your_groq_api_key_here"
GROQ_MODEL=openai/gpt-oss-120b

# Vector Database (Pinecone Serverless: https://www.pinecone.io)
PINECONE_API_KEY="your_pinecone_api_key_here"
PINECONE_INDEX_NAME=fde-it-support-rag
PINECONE_NAMESPACE=company-it-kb

# Open-Source Embedding Model (Local 384-dimensional FastEmbed model)
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Web Search Fallback (Tavily free tier: https://tavily.com)
TAVILY_API_KEY="your_tavily_api_key_here"

# RAG & Routing Configurations
TOP_K=4
MAX_RETRIES=1

# Admin Security Key for /api/ingest
ADMIN_API_KEY="change-me"
```

---

## 3. Dependency Management with `uv`

Run the following commands in PowerShell from the project root:

```powershell
# 1. Create the virtual environment using Python 3.12
uv venv .venv --python 3.12

# 2. Install all required dependencies
uv pip install -r requirements.txt
```

---

## 4. Ingest Sample Knowledge Base into Pinecone

Before starting the server for the first time (or whenever you add new documents to `data/sample_kb/`), run the ingestion script to chunk, embed, and store vectors into Pinecone:

```powershell
.venv\Scripts\python.exe ingest_sample_kb.py
```

*Expected output:*
```text
Loading: company_it_handbook.md
Loading: service_desk_runbook.md
Created 5 chunks from 2 files.
Uploading vectors to Pinecone index 'fde-it-support-rag'...
Successfully indexed 2 files -> 5 chunks -> 5 Pinecone vectors.
```

---

## 5. Run the Application

Start the FastAPI application server:

```powershell
.venv\Scripts\python.exe run.py
```

The application will be live at:
- **Web UI & Chatbot**: [http://127.0.0.1:8080](http://127.0.0.1:8080)
- **Interactive Swagger API Docs**: [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)
- **Health Check Endpoint**: [http://127.0.0.1:8080/api/health](http://127.0.0.1:8080/api/health)

---

## 6. How the LangGraph Workflow Operates

When a user submits a question via the web interface:

```text
User Question
      ↓
[1. Route Question]  ──(Casual / Greeting)──→  [Direct Response]
      ↓ (IT Problem)
[2. Retrieve Private KB (Pinecone)]
      ↓
[3. Grade Evidence]  ──(Good)──→  [Generate Grounded Answer from Private KB]
      ↓ (Weak)
[4. Web Search Fallback (Tavily)]
      ↓
[5. Grade Web Evidence]
      ├──(Good)───────────────→  [Generate Answer with Vendor Disclaimer]
      ├──(Weak & Retries Left)─→  [Rewrite Technical Query & Retry Retrieval]
      └──(Insufficient)───────→  [Escalate to IT Helpdesk Message]
```

### Verification Questions to Test:
1. **Private Company KB Query**:
   - `"How do I connect to the company VPN?"`
   - *Result*: Routes to `KB` → grades evidence `GOOD` → answers strictly from `company_it_handbook.md`.
2. **Web Fallback Query**:
   - `"What is the latest Microsoft Teams outage guidance?"`
   - *Result*: Routes to `KB` → internal evidence is `WEAK` → falls back to Tavily search → answers from web search with validation notice.
3. **Direct Greeting**:
   - `"Hello, how are you?"`
   - *Result*: Routes directly to `DIRECT` → responds conversationally without querying vector stores.
