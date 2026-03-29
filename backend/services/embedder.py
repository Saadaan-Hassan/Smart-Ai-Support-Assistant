"""
Embedding service — singleton pattern.

The SentenceTransformer model is loaded ONCE at startup (expensive, ~90 MB)
and reused for all requests. This avoids reloading on every ingest/ask call.
"""

import numpy as np
from sentence_transformers import SentenceTransformer

from core.config import settings

# ── Singleton ─────────────────────────────────────────────────────────────────

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """Lazy-load the embedding model (initialised once)."""
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Embed a list of strings into float32 vectors.

    Args:
        texts: List of strings to embed.

    Returns:
        numpy array of shape (len(texts), embedding_dim), dtype float32.
    """
    model = get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return embeddings.astype(np.float32)


def embed_query(query: str) -> np.ndarray:
    """
    Embed a single query string.

    Returns:
        numpy array of shape (1, embedding_dim), dtype float32.
    """
    return embed_texts([query])
