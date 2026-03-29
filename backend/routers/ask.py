"""
POST /ask

Accepts a session_id + question.
Retrieves relevant chunks via FAISS similarity search,
then streams the Groq LLM response as Server-Sent Events (SSE).

SSE event format:
  data: <token>          — individual token
  data: [SOURCES]        — JSON array of source chunks (sent last)
  data: [DONE]           — signals stream end
"""

import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from core.config import settings
from core.session_store import get_session
from schemas.models import AskRequest
from services.embedder import embed_query
from services.llm import stream_answer
from services.vector_store import search_index

router = APIRouter()


async def _event_generator(question: str, session_id: str):
    """Async generator producing SSE-formatted chunks."""

    # ── 1. Load session ───────────────────────────────────────────────────────
    session = await get_session(session_id)
    if session is None:
        yield "data: [ERROR] Session not found or expired.\n\n"
        return

    # ── 2. Embed question + retrieve top-k chunks ─────────────────────────────
    query_vec = embed_query(question)
    relevant_chunks = search_index(
        session.index,
        query_vec,
        session.chunks,
        top_k=settings.top_k_chunks,
    )

    if not relevant_chunks:
        yield "data: I don't have enough information to answer that.\n\n"
        yield "data: [DONE]\n\n"
        return

    # ── 3. Stream LLM response ────────────────────────────────────────────────
    async for token in stream_answer(question, relevant_chunks):
        # Escape newlines so SSE stays well-formed
        safe_token = token.replace("\n", "\\n")
        yield f"data: {safe_token}\n\n"

    # ── 4. Send sources for front-end highlighting ────────────────────────────
    sources_payload = json.dumps(relevant_chunks)
    yield f"data: [SOURCES]{sources_payload}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/ask")
async def ask(body: AskRequest) -> StreamingResponse:
    """
    Ask a question against an ingested knowledge base (session).
    Returns a Server-Sent Events stream.
    """
    if not body.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    return StreamingResponse(
        _event_generator(body.question, body.session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disables Nginx buffering on Render
        },
    )
