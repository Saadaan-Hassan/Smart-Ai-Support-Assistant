"""
Global in-memory session store.

Each session holds:
  - A FAISS index (per-user vector DB)
  - The raw text chunks (for source highlighting)
  - Timestamps for TTL-based eviction

Thread safety: asyncio.Lock guards all mutations.
A background task (started in main.py lifespan) purges stale sessions
every 30 minutes.
"""

import asyncio
import time
from dataclasses import dataclass, field

import faiss

from core.config import settings


@dataclass
class SessionData:
    index: faiss.Index
    chunks: list[str]
    created_at: float = field(default_factory=time.time)
    last_accessed: float = field(default_factory=time.time)


# ── Global store ─────────────────────────────────────────────────────────────

_store: dict[str, SessionData] = {}
_lock = asyncio.Lock()


# ── Public API ────────────────────────────────────────────────────────────────


async def save_session(session_id: str, index: faiss.Index, chunks: list[str]) -> None:
    """Persist an embedded index + its source chunks for a session."""
    async with _lock:
        _store[session_id] = SessionData(index=index, chunks=chunks)


async def get_session(session_id: str) -> SessionData | None:
    """Retrieve session data and refresh last_accessed timestamp."""
    async with _lock:
        data = _store.get(session_id)
        if data:
            data.last_accessed = time.time()
        return data


async def delete_session(session_id: str) -> None:
    async with _lock:
        _store.pop(session_id, None)


# ── TTL cleanup ───────────────────────────────────────────────────────────────


async def cleanup_loop() -> None:
    """Background task: evict sessions older than SESSION_TTL every 30 min."""
    while True:
        await asyncio.sleep(1800)  # 30 minutes
        now = time.time()
        async with _lock:
            stale = [
                sid
                for sid, data in _store.items()
                if now - data.last_accessed > settings.session_ttl
            ]
            for sid in stale:
                del _store[sid]
