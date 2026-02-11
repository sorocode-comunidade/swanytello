# RAG LLMs

This folder holds **LLM (Large Language Model) integrations** used by RAG. Each provider (OpenAI, Claude, Ollama, etc.) is implemented here so chains in `../chains/` can use a unified interface and switch providers via configuration.

## Purpose

- **OpenAI** – Integration with OpenAI API (GPT-4, etc.).
- **Claude** – Integration with Anthropic Claude API.
- **Ollama** – Integration with local Ollama (e.g. Llama, Mistral) for development or self-hosted use.
- Other providers can be added following the same pattern.

Provider modules use the naming pattern **`{provider}.llm.ts`** (e.g. `ollama.llm.ts`, `openai.llm.ts`). Each should expose a LangChain-compatible chat model or a factory that returns one; configuration (API keys, base URLs, model names) comes from environment variables.

### Provider selection

`getChatModel()` (used by the chain) picks the provider as follows:

1. If **RAG_LLM_PROVIDER** is set in `.env`, that value is used (`openai` or `ollama`).
2. If **RAG_LLM_PROVIDER** is not set and **OPENAI_API_KEY** is set, **OpenAI** is used.
3. Otherwise **Ollama** is used (default).

So you can use OpenAI by setting only **OPENAI_API_KEY** (and optionally **OPENAI_MODEL**); no need to set `RAG_LLM_PROVIDER=openai` unless you want to force it. Ensure `.env` is loaded at app startup (e.g. `import "dotenv/config"` in `server.ts`).

### Ollama

- **OLLAMA_BASE_URL** – Optional. Default `http://localhost:11434`.
- **OLLAMA_MODEL** – Optional. Default `llama3.2`.

### OpenAI

- **OPENAI_API_KEY** – Required when using OpenAI (either `RAG_LLM_PROVIDER=openai` or unset with this key present).
- **OPENAI_MODEL** – Optional. Default `gpt-4o-mini`.

## See Also

- [Chains](../chains/README.md) – Where LLMs are used in RAG chains
- [LangChain Chat Models](https://js.langchain.com/docs/modules/model_io/chat/) – LangChain JS chat model usage
