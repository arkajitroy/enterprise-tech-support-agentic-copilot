# Enterprise IT Support Copilot — Modern Frontend

A modern, minimalist, non-generic React application engineered for the Enterprise IT Support Agentic RAG system.

---

## 🛠️ Stack & Architecture

- **Framework**: React 19 + TypeScript + Vite 8
- **Data Fetching & State**: TanStack Query (`@tanstack/react-query` v5)
- **HTTP Client**: Axios with configured `/api` proxy & error interceptors
- **Styling**: Tailwind CSS v4 + Obsidian Glassmorphic Design System
- **Icons**: Lucide React
- **Markdown Rendering**: Marked (with formatted citations, code blocks, lists)

---

## 🚀 Running the Frontend

### 1. Ensure the Backend Server is Running
Make sure the FastAPI backend is running on `http://127.0.0.1:8080`:
```powershell
.venv\Scripts\python.exe run.py
```

### 2. Start the Frontend Development Server
From the `client/` folder:
```powershell
# In client directory
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

All `/api` requests (e.g., `/api/chat`, `/api/health`, `/api/ingest`) are automatically proxied by Vite to `http://127.0.0.1:8080`.

---

## 🌟 Key Features

1. **Autonomous LangGraph Telemetry**:
   - Right-hand drawer displaying real-time node transitions (`Router → KB`, `Private KB retrieval`, `KB evidence grade`, `Web fallback`, `Synthesis`).
2. **Dynamic Source Verification Badges**:
   - 🟢 **Verified Private KB**: Grounded in company documentation (`company_it_handbook.md`).
   - 🟡 **External Web Fallback**: Real-time Tavily search with clickable links and vendor verification disclaimer.
   - 🔵 **Direct Conversational**: Greeting or casual interaction without retrieval overhead.
3. **Interactive Document Ingestion**:
   - Built-in modal allowing authorized staff to drag-and-drop `.pdf`, `.txt`, `.md`, or `.docx` files to chunk and index directly into Pinecone.
4. **Suggested Inquiries**:
   - Instant single-click prompt chips on the sidebar to test all core agentic paths.
