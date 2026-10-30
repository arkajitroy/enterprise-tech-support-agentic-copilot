"""
FastAPI application entry-point.
Mounts static files, Jinja2 templates, and API router.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import router as api_router

app = FastAPI(
    title="Enterprise IT Support Agentic RAG Copilot",
    description="Agentic RAG system for enterprise IT knowledge base Q&A.",
    version="0.1.0",
)

# Static files (CSS, JS)
app.mount("/static", StaticFiles(directory="src/static"), name="static")

# Jinja2 templates
templates = Jinja2Templates(directory="src/templates")

# API routes
app.include_router(api_router, prefix="/api")

