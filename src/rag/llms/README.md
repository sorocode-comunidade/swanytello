# RAG LLMs

This folder holds **LLM (Large Language Model) integrations** used by RAG. Each provider (OpenAI, Claude, Ollama, etc.) is implemented here so chains in `../chains/` can use a unified interface and switch providers via configuration.

## Purpose

- **OpenAI** – Integration with OpenAI API (GPT-4, etc.).
- **Claude** – Integration with Anthropic Claude API.
- **Ollama** – Integration with local Ollama (e.g. Llama, Mistral) for development or self-hosted use.
- Other providers can be added following the same pattern.

Provider modules use the naming pattern **`{provider}.llm.ts`** (e.g. `ollama.llm.ts`, `openai.llm.ts`). Each should expose a LangChain-compatible chat model or a factory that returns one; configuration (API keys, base URLs, model names) comes from environment variables.

### Provider selection

Set **RAG_LLM_PROVIDER** in `.env` to choose the chat model (default: `ollama`):

- **`ollama`** – Local Ollama (OLLAMA_BASE_URL, OLLAMA_MODEL). Ollama must be running.
- **`openai`** – OpenAI API (OPENAI_API_KEY required, OPENAI_MODEL optional).

The chain uses `getChatModel()` from this folder so no code change is needed when switching.

### Ollama

- **OLLAMA_BASE_URL** – Optional. Default `http://localhost:11434`.
- **OLLAMA_MODEL** – Optional. Default `llama3.2`.

### OpenAI

- **OPENAI_API_KEY** – Required when `RAG_LLM_PROVIDER=openai`.
- **OPENAI_MODEL** – Optional. Default `gpt-4o-mini`.

## See Also

- [Chains](../chains/README.md) – Where LLMs are used in RAG chains
- [LangChain Chat Models](https://js.langchain.com/docs/modules/model_io/chat/) – LangChain JS chat model usage
