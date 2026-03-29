"""
POST /ingest

Accepts raw text (form field) OR a .txt file upload.
Chunks, embeds, and stores the content in a new session.
Returns a session_id the client must persist (e.g. localStorage).
"""

import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from core.session_store import save_session
from schemas.models import IngestResponse
from services.chunker import chunk_text
from services.embedder import embed_texts
from services.vector_store import build_index

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
async def ingest(
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
) -> IngestResponse:
    """
    Ingest raw text or a .txt file, generate embeddings, and store in a session.
    """
    # ── 1. Extract raw text ──────────────────────────────────────────────────
    raw_text = ""

    if file is not None:
        if not file.filename.endswith(".txt"):
            raise HTTPException(
                status_code=400,
                detail="Only .txt files are supported.",
            )
        content = await file.read()
        raw_text = content.decode("utf-8", errors="replace")

    elif text is not None:
        raw_text = text.strip()

    if not raw_text:
        raise HTTPException(
            status_code=422,
            detail="Provide either 'text' or a .txt file upload.",
        )

    # ── 2. Chunk ──────────────────────────────────────────────────────────────
    chunks = chunk_text(raw_text)

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="No content could be extracted from the provided input.",
        )

    # ── 3. Embed ──────────────────────────────────────────────────────────────
    embeddings = embed_texts(chunks)

    # ── 4. Build FAISS index + save session ───────────────────────────────────
    index = build_index(embeddings)
    session_id = str(uuid.uuid4())
    await save_session(session_id, index, chunks)

    return IngestResponse(
        session_id=session_id,
        chunk_count=len(chunks),
        message="Content processed successfully.",
    )
