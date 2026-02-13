# RAG LLMs

This folder holds **LLM (Large Language Model) integrations** used by RAG. Providers are Ollama Cloud (default) and OpenAI; configuration is via environment variables.

## Purpose

- **Ollama Cloud** – Default. Integration with Ollama Cloud via the official `ollama` package (`ollama.chat({ model, messages })`). No local server; lightweight for all machines.
- **OpenAI** – Integration with OpenAI API (GPT-4, etc.).
- Other providers can be added following the same pattern.

Provider modules use the naming pattern **`{provider}.llm.ts`** (e.g. `ollama-cloud.llm.ts`, `openai.llm.ts`). Each exposes a chat model or factory with an `invoke(message)` interface; configuration comes from environment variables.

### Provider selection (default: Ollama Cloud)

**Ollama Cloud is the main default** so users don’t need to run a heavy local LLM. Override by setting `.env` (e.g. `OPENAI_API_KEY=...` for OpenAI).

`getChatModel()` (used by the chain) picks the provider as follows:

1. If **RAG_LLM_PROVIDER** is set in `.env`, that value is used (`openai` or `ollama-cloud`).
2. If **RAG_LLM_PROVIDER** is not set and **OPENAI_API_KEY** is set, **OpenAI** is used.
3. Otherwise **Ollama Cloud** is used (default).

So you can use OpenAI by setting only **OPENAI_API_KEY** (and optionally **OPENAI_MODEL**). Ensure `.env` is loaded at app startup (e.g. `import "dotenv/config"` in `server.ts`).

### Ollama Cloud (default)

- **OLLAMA_CLOUD_HOST** – Optional. Default `https://api.ollama.com`.
- **OLLAMA_CLOUD_MODEL** – Optional. Default `glm-4.7-flash`. Override in `.env` only if you want a different model.
- **OLLAMA_API_KEY** – Optional. API key for Ollama Cloud (Bearer token in `Authorization` header).

### OpenAI

- **OPENAI_API_KEY** – Required when using OpenAI (either `RAG_LLM_PROVIDER=openai` or unset with this key present).
- **OPENAI_MODEL** – Optional. Default `gpt-4o-mini`.

## See Also

- [Chains](../chains/README.md) – Where LLMs are used in RAG chains
- [LangChain Chat Models](https://js.langchain.com/docs/modules/model_io/chat/) – LangChain JS chat model usage
