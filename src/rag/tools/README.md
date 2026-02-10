# RAG Tools

This folder holds **tool definitions** for the RAG agent. Tools are callable functions that the agent can use (e.g. to query data via the API, search, or perform actions). They are passed to chains/agents and must **not** import from `src/db_operations/` directly—use API tool functions or other allowed interfaces instead.

## Purpose

- Define tools that the RAG agent can invoke (e.g. “get open positions”, “search”).
- Tools wrap API calls or other safe operations; they do not access the database directly.
- Tools are used by chains (in `../chains/`) and receive results only from the API layer.

## See Also

- [Chains](../chains/README.md) – Where tools are wired into chains/agents
- [API README](../../api/README.md) – Tool function implementation and exposed endpoints
