from pydantic import BaseModel


# ── /ingest ───────────────────────────────────────────────────────────────────

class IngestResponse(BaseModel):
    session_id: str
    chunk_count: int
    message: str


# ── /ask ─────────────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    session_id: str
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]
