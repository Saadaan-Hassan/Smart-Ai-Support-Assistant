from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # LLM
    groq_api_key: str

    # RAG tuning
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_chunks: int = 4

    # Groq model
    groq_model: str = "openai/gpt-oss-120b"

    # Session TTL (seconds)
    session_ttl: int = 7200  # 2 hours

    # Embedding model (loaded once at startup)
    embedding_model: str = "all-MiniLM-L6-v2"

    # CORS — comma-separated list of allowed origins
    allowed_origins: str = "*"


settings = Settings()
