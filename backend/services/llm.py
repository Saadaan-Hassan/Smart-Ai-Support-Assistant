"""
LLM service — Groq via LangChain.

Builds the RAG prompt and streams the response token-by-token.
The system prompt enforces strict context-only answering and
the required fallback message.
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from core.config import settings

# ── Prompt template ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are a helpful assistant that answers questions STRICTLY based on the \
provided context below.

Rules:
1. Only use information explicitly present in the context.
2. If the answer cannot be found in the context, respond EXACTLY with:
   "I don't have enough information to answer that."
3. Do not make up information or use any external knowledge.
4. Be concise, clear, and direct.
5. Do not reference the context or say "based on the context" — just answer.

Context:
{context}
"""

_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        ("human", "{question}"),
    ]
)

# ── LLM instance (created once, reused per request) ──────────────────────────

_llm = ChatGroq(
    model=settings.groq_model,
    api_key=settings.groq_api_key,
    temperature=0,       # deterministic — crucial for strict context-only responses
    streaming=True,
)

_chain = _prompt | _llm


# ── Public API ────────────────────────────────────────────────────────────────

async def stream_answer(question: str, context_chunks: list[str]):
    """
    Stream the LLM answer token-by-token.

    Args:
        question:       The user's question.
        context_chunks: Retrieved chunks to use as context.

    Yields:
        str tokens from the LLM stream.
    """
    context = "\n\n---\n\n".join(context_chunks)
    async for chunk in _chain.astream({"question": question, "context": context}):
        if chunk.content:
            yield chunk.content
