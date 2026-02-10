# RAG LLMs

This folder holds **LLM (Large Language Model) integrations** used by RAG. Each provider (OpenAI, Claude, Ollama, etc.) is implemented here so chains in `../chains/` can use a unified interface and switch providers via configuration.

## Purpose

- **OpenAI** – Integration with OpenAI API (GPT-4, etc.).
- **Claude** – Integration with Anthropic Claude API.
- **Ollama** – Integration with local Ollama (e.g. Llama, Mistral) for development or self-hosted use.
- Other providers can be added following the same pattern.

Implementations should expose a LangChain-compatible chat model or LLM instance (or a factory that returns one) so chains can use them without caring about the provider. Configuration (API keys, base URLs, model names) should come from environment variables or a shared config module.

### Ollama

- **OLLAMA_BASE_URL** – Optional. Default `http://localhost:11434`.
- **OLLAMA_MODEL** – Optional. Default `llama3.2`.

Ollama must be running locally (or at the configured base URL) when using this provider.

## See Also

- [Chains](../chains/README.md) – Where LLMs are used in RAG chains
- [LangChain Chat Models](https://js.langchain.com/docs/modules/model_io/chat/) – LangChain JS chat model usage
