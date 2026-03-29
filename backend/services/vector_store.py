"""
FAISS vector store helpers.

Each session gets its own IndexFlatL2 index — simple, exact search,
no training required. Perfect for small-to-medium document chunks.
"""

import faiss
import numpy as np


def build_index(embeddings: np.ndarray) -> faiss.Index:
    """
    Build a FAISS flat L2 index from a batch of embeddings.

    Args:
        embeddings: float32 array of shape (n_chunks, dim).

    Returns:
        A populated faiss.IndexFlatL2 ready for search.
    """
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    return index


def search_index(
    index: faiss.Index,
    query_vector: np.ndarray,
    chunks: list[str],
    top_k: int,
) -> list[str]:
    """
    Retrieve the top-k most similar chunks for a query vector.

    Args:
        index:        The FAISS index to search.
        query_vector: float32 array of shape (1, dim).
        chunks:       Original text chunks aligned with index entries.
        top_k:        Number of results to return.

    Returns:
        List of matching chunk strings (closest first).
    """
    # Clamp top_k so we never ask for more than we have
    k = min(top_k, index.ntotal)
    _, indices = index.search(query_vector, k)

    results: list[str] = []
    for idx in indices[0]:
        if idx != -1 and idx < len(chunks):
            results.append(chunks[idx])
    return results
