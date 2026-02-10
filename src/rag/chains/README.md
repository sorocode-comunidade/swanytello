# RAG Chains

This folder holds **LangChain chains** and agent orchestration for RAG. Chains combine retrieval, LLM calls (from `../llms/`), and tool use (from `../tools/`) to implement the full RAG flow.

## Purpose

- Define chains that orchestrate: retrieval → context building → LLM call → (optional) tool use → response.
- Use LLMs from `../llms/` (OpenAI, Claude, Ollama, etc.) for generation.
- Use tools from `../tools/` for database or other operations via the API.
- Keep retrieval logic (e.g. vector search, document loading) and prompt construction here or in dedicated modules.

## See Also

- [Tools](../tools/README.md) – Tool definitions used by chains
- [LLMs](../llms/README.md) – LLM integrations (OpenAI, Claude, Ollama, etc.)
