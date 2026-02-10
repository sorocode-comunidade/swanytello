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

## See Also

- [Architecture Documentation](../../docs/project_structure/architecture.md) – Detailed architectural explanation
- [Database Operations](../db_operations/README.md) – Why RAG uses tool functions
- [API README](../api/README.md) – Tool function implementation
