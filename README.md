# Smart AI Support Assistant

A full-stack, context-aware RAG chatbot that answers questions **strictly from user-provided content**. Built for the MindVista Technical Assessment.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Backend](#backend-fastapi)
  - [Frontend](#frontend-nextjs)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Assumptions Made](#assumptions-made)
- [Bonus Features Implemented](#bonus-features-implemented)
- [Known Limitations & Possible Improvements](#known-limitations--possible-improvements)

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://assistant.saadaan.dev/ |
| Backend  | https://assistant-api.saadaan.dev/ |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework with server/client components |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui** | Accessible, unstyled component primitives |
| **Radix UI** | Headless UI primitives (Tabs, HoverCard, etc.) |
| **Motion (Framer)** | Smooth page transitions and micro-animations |
| **react-markdown + remark-gfm** | Renders AI responses as rich Markdown (tables, code blocks, lists) |
| **Sonner** | Toast notification system |
| **Lucide React** | Icon set |
| **pnpm** | Fast, disk-efficient package manager |

### Backend

| Technology | Purpose |
|---|---|
| **Python 3.11+** | Runtime |
| **FastAPI** | High-performance async API framework |
| **Uvicorn** | ASGI server |
| **LangChain** (`langchain-core`, `langchain-groq`, `langchain-text-splitters`) | RAG orchestration, prompt templating, and LLM integration |
| **Groq API** (`openai/gpt-oss-120b`) | LLM inference for streaming responses (Ultra-fast) |
| **Sentence Transformers** (`all-MiniLM-L6-v2`) | Local embedding model — no external API calls for embeddings |
| **FAISS** (`faiss-cpu`) | In-memory vector similarity search |
| **Pydantic v2 + pydantic-settings** | Data validation and settings management |
| **python-multipart** | Multipart form data (file upload) parsing |
| **uv** | Fast Python package manager and virtual environment tool |

---

## Project Structure

```
mindvista-technical-assessment/
├── backend/                        # FastAPI application
│   ├── core/
│   │   ├── config.py               # Centralised settings via pydantic-settings
│   │   └── session_store.py        # In-memory per-user session store (FAISS + chat history)
│   ├── routers/
│   │   ├── ingest.py               # POST /ingest — chunk, embed, store
│   │   └── ask.py                  # POST /ask   — retrieve, stream SSE answer
│   ├── schemas/
│   │   └── models.py               # Pydantic request/response models
│   ├── services/
│   │   ├── chunker.py              # Text splitting via LangChain RecursiveCharacterTextSplitter
│   │   ├── embedder.py             # Singleton SentenceTransformer embedding model
│   │   ├── llm.py                  # Groq LLM + RAG prompt template + streaming
│   │   └── vector_store.py         # FAISS index build + similarity search
│   ├── main.py                     # App factory, CORS, router registration, lifespan events
│   ├── pyproject.toml              # Project metadata and dependencies (uv)
│   ├── railway.toml                # Railway deployment config
│   └── .env.example                # Environment variable template
│
└── frontend/                       # Next.js 16 application
    ├── app/
    │   ├── layout.tsx              # Root layout (font, theme, session provider, navbar)
    │   ├── page.tsx                # Single-page app: KnowledgeInput ↔ ChatInterface
    │   ├── globals.css             # Global styles and Tailwind custom utilities
    │   └── not-found.tsx           # Custom 404 page
    ├── components/
    │   ├── views/
    │   │   ├── knowledge-input.tsx # Page 1: paste text or upload .txt file
    │   │   └── chat-interface.tsx  # Page 2: chat UI with animated message list
    │   ├── chat/
    │   │   ├── chat-message.tsx    # Individual message bubble + source citations
    │   │   ├── chat-input.tsx      # Auto-resizing textarea with send/stop controls
    │   │   └── markdown-renderer.tsx # Rich markdown rendering (GFM tables, code, etc.)
    │   └── ui/                     # shadcn/ui components (Button, Tabs, HoverCard, etc.)
    ├── contexts/
    │   └── session-context.tsx     # Global React context for session_id state
    ├── hooks/
    │   └── use-chat.ts             # Custom hook: SSE stream reader, message state, abort
    ├── constants/
    │   └── api-routes.ts           # Centralised API route constants (/ingest, /ask)
    ├── lib/
    │   ├── api.ts                  # ingestContent() fetch wrapper
    │   └── utils.ts                # cn() utility (clsx + tailwind-merge)
    └── .env.local                  # NEXT_PUBLIC_API_URL (local development)
```

---

## How It Works

### RAG Pipeline (Option A — Preferred)

```
User Input (text / .txt file)
        │
        ▼
  ┌─────────────┐
  │  /ingest    │  1. Extract raw text from form field or uploaded file
  └──────┬──────┘  2. Split into overlapping chunks (500 chars, 50 overlap)
         │         3. Embed each chunk → float32 vectors (all-MiniLM-L6-v2)
         ▼         4. Build per-session FAISS IndexFlatL2
  Session Store    5. Return session_id to frontend → stored in React Context
  (in-memory)
        │
        │  User asks a question
        ▼
  ┌─────────────┐
  │   /ask      │  1. Embed the question with the same SentenceTransformer
  └──────┬──────┘  2. FAISS top-k similarity search → retrieve relevant chunks
         │         3. Inject chunks as context into the system prompt
         ▼         4. Stream Groq LLM response token-by-token via SSE
  Frontend         5. Frontend reads the SSE stream, rendering tokens in real-time
  (SSE stream)     6. Source chunks sent as [SOURCES] event → displayed in UI
```

### Strict Context-Only Answering

The system prompt explicitly instructs the LLM:

> *"If the answer cannot be found or inferred from the context or history, respond EXACTLY with: 'I don't have enough information to answer that.'"*

The model operates at `temperature=0.1` to minimise hallucination while still allowing natural synthesis of retrieved context.

### Session & Chat Memory

- Each `/ingest` call generates a **UUID session ID** and stores a `SessionData` object (FAISS index + raw chunks + `LangChain` message history).
- Subsequent `/ask` calls pass the full `HumanMessage` / `AIMessage` history through a `MessagesPlaceholder` in the prompt — enabling coherent follow-up questions within a session.
- A background `asyncio` task evicts sessions idle for more than 2 hours (configurable via `SESSION_TTL`).

### Streaming (SSE Protocol)

The `/ask` endpoint returns a `StreamingResponse` with `media_type="text/event-stream"`. Each SSE event is one of:

| Event | Meaning |
|---|---|
| `data: <token>` | A streamed LLM token |
| `data: [SOURCES]<json>` | JSON array of retrieved source chunks |
| `data: [DONE]` | Stream complete |
| `data: [ERROR] <msg>` | Backend error (e.g. session not found) |

---

## Setup Instructions

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11 or higher |
| uv (Python package manager) | Latest | Fast replacement for pip/venv. [[Install Guide](https://docs.astral.sh/uv/getting-started/installation/)] |

#### How to install `uv`:
- **Windows (PowerShell)**: 
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- **Linux / macOS**:
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
- **Via pip** (Universal):
  ```bash
  pip install uv
  ```
| Node.js | 18 or higher |
| pnpm | Latest (`npm install -g pnpm`) |
| Groq API Key | Free at [console.groq.com](https://console.groq.com) |

---

### Backend (FastAPI)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment and install dependencies
uv sync

# 3. Copy the environment template and fill in your Groq API key
cp .env.example .env
# Then open .env and set: GROQ_API_KEY=your_groq_api_key_here

# 4. Start the development server
uv run uvicorn main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**

Interactive API docs: **http://localhost:8000/docs**

---

### Frontend (Next.js)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
pnpm install

# 3. Set the backend URL (already configured for local dev)
cp .env.example .env.local
# Then edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Start the development server
pnpm dev
```

The app will be available at: **http://localhost:3000**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Your Groq API key |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | Groq model identifier |
| `CHUNK_SIZE` | No | `500` | Max characters per text chunk |
| `CHUNK_OVERLAP` | No | `50` | Overlap between consecutive chunks |
| `TOP_K_CHUNKS` | No | `10` | Number of chunks retrieved per query |
| `SESSION_TTL` | No | `7200` | Session expiry in seconds (2 hours) |
| `EMBEDDING_MODEL` | No | `all-MiniLM-L6-v2` | SentenceTransformer model name |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated CORS origins |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | `http://localhost:8000` | Backend API base URL |

---

## API Reference

### `POST /ingest`

Accepts raw text or a `.txt` file upload. Returns a `session_id` used for subsequent questions.

**Request** (multipart/form-data):

| Field | Type | Description |
|---|---|---|
| `text` | `string` (optional) | Raw text to ingest |
| `file` | `File` (optional) | `.txt` file to ingest |

> At least one of `text` or `file` must be provided.

**Response** (`200 OK`):
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "chunk_count": 14,
  "message": "Content processed successfully."
}
```

---

### `POST /ask`

Accepts a `session_id` and a `question`. Streams the answer as Server-Sent Events.

**Request** (`application/json`):
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "What is the refund policy?"
}
```

**Response** (`text/event-stream`):
```
data: Based on the provided content, the refund policy...
data:  allows returns within 30 days.
data: [SOURCES]["Refund policy: returns accepted...", "Contact support at..."]
data: [DONE]
```

---

### `GET /health`

Returns `{"status": "ok"}` — used by Railway for health checks.

---

## Assumptions Made

1. **Single document per session** — Each `/ingest` call creates a fresh session. There is no concept of appending to an existing knowledge base; users start over by refreshing.

2. **`.txt` files only** — The backend only accepts plain-text (`.txt`) uploads. PDF, DOCX, and other formats are out of scope for this assessment.

3. **Session stored in-memory** — Sessions live in the server process memory and are not persisted to disk or a database. A server restart clears all sessions. This is intentional for simplicity and for this demo.

4. **No user authentication** — The `session_id` (UUID) acts as a lightweight secret; anyone who knows the ID can query the session. Authentication is out of scope.

5. **Embeddings run locally** — The `all-MiniLM-L6-v2` SentenceTransformer model (~90 MB) is downloaded and run on the server at startup. No external embedding API is called, keeping costs at zero.

6. **Flat FAISS index** — `IndexFlatL2` performs exact (brute-force) search. This is fast and accurate for the small document sizes expected in this use case. For larger corpora, an approximate index (e.g. `IndexIVFFlat`) would be preferable.

7. **Chat history is session-scoped and in-memory** — Conversation history (for follow-up questions) is stored per session on the backend. It is not persisted across server restarts.

---

## Bonus Features Implemented

| Feature | Implementation |
|---|---|
| ✅ **Streaming responses (typing effect)** | `/ask` returns Server-Sent Events; frontend reads the stream token-by-token using the Fetch API's `ReadableStream` |
| ✅ **Source/context highlighting** | Retrieved chunks are sent as a `[SOURCES]` SSE event and displayed as hoverable citation chips below each AI response |
| ✅ **Basic chat memory** | `LangChain` `MessagesPlaceholder` injects full `HumanMessage`/`AIMessage` history into every LLM call, enabling coherent follow-up questions |
| ✅ **LangChain** | Used for `RecursiveCharacterTextSplitter`, `ChatPromptTemplate`, `MessagesPlaceholder`, and `ChatGroq` LLM integration |
| ✅ **Deployment** | Frontend on **Vercel**, backend on **Railway** |
| ✅ **Dark / Light mode** | Full system-preference-aware theme toggle using `next-themes` |
| ✅ **Drag-and-drop file upload** | The file tab accepts drag-and-drop of `.txt` files, auto-switching tabs on drag |
| ✅ **Abortable streams** | Users can stop a running response mid-stream via `AbortController` |

---

## Known Limitations & Possible Improvements

| Limitation | Potential Improvement |
|---|---|
| In-memory sessions lost on restart | Persist sessions to **Redis** or a vector database (e.g. Chroma, Pinecone) |
| Only `.txt` files supported | Add **PDF / DOCX** parsing via `pypdf` or `python-docx` |
| No user authentication | Add JWT-based auth or session cookies |
| Single embedding model | Support pluggable embedders (OpenAI, Cohere) via a factory pattern |
| No persistent chat history | Store conversations in a database for cross-session continuity |
| Flat FAISS index | Migrate to an approximate index (`IndexIVFFlat`) for large document sets |
| Frontend session lost on page refresh | Persist `session_id` to `localStorage` for tab-reload resilience |
