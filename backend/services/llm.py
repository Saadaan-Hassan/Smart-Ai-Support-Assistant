"""
LLM service — Groq via LangChain.

Builds the RAG prompt and streams the response token-by-token.
The system prompt enforces strict context-only answering and
the required fallback message.
"""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import BaseMessage
from langchain_groq import ChatGroq

from core.config import settings

# ── Prompt template ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are a helpful assistant answering queries based primarily on the \
provided context below, and previous parts of this conversation.

Rules:
1. Use the information in the context to construct your answer.
2. If the user's question is a follow-up, use the chat history to understand it.
3. If the answer cannot be found or inferred from the context or history, respond EXACTLY with:
   "I don't have enough information to answer that."
4. Do not make up facts or bring in external knowledge not supported by the context.
5. Be concise, clear, and direct.
6. Do not reference the context explicitly (e.g., don't say "based on the context") — just answer naturally.

Context:
{context}
"""

_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

# ── LLM instance (created once, reused per request) ──────────────────────────

_llm = ChatGroq(
    model=settings.groq_model,
    api_key=settings.groq_api_key,
    temperature=0.1,     # Slight temperature allows for minimal synthesis of context
    streaming=True,
)

_chain = _prompt | _llm


# ── Public API ────────────────────────────────────────────────────────────────

async def stream_answer(question: str, context_chunks: list[str], history: list[BaseMessage]):
    """
    Stream the LLM answer token-by-token.

    Args:
        question:       The user's question.
        context_chunks: Retrieved chunks to use as context.
        history:        Previous chat messages in this session.

    Yields:
        str tokens from the LLM stream.
    """
    context = "\n\n---\n\n".join(context_chunks) if context_chunks else "No specific context retrieved."
    
    async for chunk in _chain.astream({
        "question": question, 
        "context": context,
        "history": history
    }):
        if chunk.content:
            yield chunk.content
