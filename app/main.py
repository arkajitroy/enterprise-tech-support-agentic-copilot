from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import get_settings, BASE_DIR
from app.core.logging import configure_logging
from app.services.audit import init_db

# Configure application-wide logging
configure_logging()
# Load application settings from environment variables
settings = get_settings()
# Ensure audit database and tables are ready
init_db()

# Initialize FastAPI application
app = FastAPI(title=settings.app_name, version="1.0.0")

# Enable Cross-Origin Resource Sharing (CORS) for modern frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API route handlers
app.include_router(router)
# Mount static assets directory for legacy Jinja template fallback
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
# Set up Jinja2 template engine for frontend rendering
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    """Render the main IT Support Copilot dashboard and chat interface."""
    return templates.TemplateResponse("index.html", {"request": request, "app_name": settings.app_name})
