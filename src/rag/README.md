# RAG (Retrieval-Augmented Generation)

This folder holds **RAG logic** using LangChain. It is where SwanyBot and DonatelloBot behavior is implemented (retrieval, generation, orchestration). User-facing communication happens through the **channels** (WhatsApp, Discord) in `src/channels`, which can call into this layer when a user message needs a RAG response.

## Purpose

### Tool-Based Database Access

**RAG agents use tool functions, not direct database access.** This is a critical architectural decision:

1. **Security**: RAG agents **never** directly import or call functions from `src/db_operations/`
2. **Tool Functions**: When RAG needs database operations, it calls **tool functions** exposed through the API
3. **Result-Only Access**: RAG only receives the **results** of database operations, never the functions themselves
4. **Hidden Implementation**: Database functions are not exposed to RAG context, keeping the database schema and operations hidden

### How It Works

```
User Message → Channel → RAG Agent
                              ↓
                    Needs database operation?
                              ↓
                    Calls API Tool Function
                              ↓
                    API Service → db_operations Model → Database
                              ↓
                    Returns result only → RAG Agent
                              ↓
                    RAG generates response → Channel → User
```

### Key Principles

- ✅ RAG receives requests from channels and generates responses
- ✅ RAG uses API tool functions for database operations
- ✅ RAG consumes data stored by ETL pipeline
- ❌ RAG **cannot** directly access `src/db_operations/`
- ❌ RAG **cannot** perform web scraping (ETL handles that)
- ❌ RAG **cannot** directly interact with channels

## Structure

| Folder | Purpose |
|--------|---------|
| **tools/** | Tool definitions for the agent (API-backed, no direct DB access). |
| **chains/** | LangChain chains and agent orchestration (retrieval, generation, tool use). |
| **llms/** | LLM integrations: Ollama Cloud (default), OpenAI, etc. |

- **llms/** – Implement provider-specific chat models (env-based config; Ollama Cloud default, no local heavy LLM).
- **tools/** – Define tools the agent can call; they use the API, not `db_operations`.
- **chains/** – Compose LLMs, tools, and retrieval into the RAG pipeline.

## Usage

- **Endpoint**: POST `/api/rag/test` (JWT required). Body: `{ "message": "..." }` (1–16384 chars). Response: `{ reply, timestamp }`.
- **Env**: Default is **Ollama Cloud** (optional `OLLAMA_CLOUD_HOST`, `OLLAMA_CLOUD_MODEL`, `OLLAMA_API_KEY`). Set `OPENAI_API_KEY` to use OpenAI.
- Full details, examples, and request-flow diagram: **[RAG documentation](../../docs/rag.md)**.

## Changing the LLM

- **Ollama Cloud** (default): Optional `OLLAMA_CLOUD_HOST`, `OLLAMA_CLOUD_MODEL`, `OLLAMA_API_KEY` in `.env`.
- **OpenAI**: Set `OPENAI_API_KEY` (and optionally `RAG_LLM_PROVIDER=openai`).
- **Other providers**: Add a new module in `src/rag/llms/`, wire it in `getChatModel()` in `src/rag/llms/index.ts`, and document env vars in [llms/README.md](llms/README.md) and `.env.example`.
- Step-by-step: **[RAG documentation – How to change the LLM](../../docs/rag.md#how-to-change-the-llm)**.

## See Also

- [RAG documentation](../../docs/rag.md) – Usage, request flow, and how to change the LLM
- [Architecture Documentation](../../docs/project_structure/architecture.md) – Detailed architectural explanation
- [Database Operations](../db_operations/README.md) – Why RAG uses tool functions
- [API README](../api/README.md) – Tool function implementation and endpoint table
