"""
Smart AI Support Assistant — FastAPI Application Entry Point
"""

import asyncio
import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.session_store import cleanup_loop
from routers import ask, ingest
from services.embedder import get_model

# ── App ───────────────────────────────────────────────────────────────────────


def create_app() -> FastAPI:
    app = FastAPI(
        title="Smart AI Support Assistant",
        description=(
            "Context-aware RAG chatbot — answers questions strictly "
            "from user-provided content."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    origins = [o.strip() for o in settings.allowed_origins.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(ingest.router, tags=["Knowledge"])
    app.include_router(ask.router, tags=["Chat"])

    # ── Lifespan events ───────────────────────────────────────────────────────
    @app.on_event("startup")
    async def startup() -> None:
        # Warm up embedding model so first /ingest isn't slow
        get_model()
        # Start background session-cleanup task
        asyncio.create_task(cleanup_loop())

    @app.get("/health", tags=["Meta"])
    async def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
