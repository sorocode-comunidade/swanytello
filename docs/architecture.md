# Swanytello Architecture

This document explains the architectural decisions and design patterns used in the Swanytello monolith.

---

## Overview

Swanytello is a **monolithic application** that combines multiple communication channels (WhatsApp, Discord) with RAG (Retrieval-Augmented Generation) capabilities. The architecture is designed to:

- **Centralize database operations** to prevent duplication and ensure consistency
- **Isolate RAG agents** from direct database access for security
- **Standardize data ingestion** through a single ETL pipeline
- **Maintain clear boundaries** between components

---

## Core Components

### 1. Database Operations (`src/db_operations/`)

**Purpose**: Centralized database access layer for all database operations across the project.

**Why this architecture?**

1. **Single Source of Truth**: All database operations are handled in one place, preventing multiple independent functions from doing the same thing. This eliminates code duplication and ensures consistency.

2. **RAG Security**: RAG agents **never** directly access database functions. Instead, they use **tool functions** that wrap database operations. This means:
   - RAG agents only see the **results** of database operations, not the functions themselves
   - Database functions are not exposed to the RAG agent's context
   - Security and access control are enforced at the API layer

3. **Consistency**: By centralizing all database operations, we ensure:
   - Consistent error handling
   - Uniform logging patterns
   - Standardized data access patterns
   - Easier maintenance and updates

**Access Control**:
- ✅ **API** (`src/api/`) – Can access `db_operations` directly
- ✅ **ETL** (`src/etl/`) – Can access `db_operations` for loading data
- ❌ **RAG** (`src/rag/`) – **Cannot** access `db_operations` directly. Must use API tool functions
- ❌ **Channels** (`src/channels/`) – **Cannot** access `db_operations` directly. Must use API

**See**: [Database Operations README](../src/db_operations/README.md)

---

### 2. ETL Pipeline (`src/etl/`)

**Purpose**: Extract, Transform, and Load operations for ingesting data from the internet.

**Why this architecture?**

1. **Single Data Ingestion Path**: Web scraping is the **only way** to retrieve information from the internet in this project. All external data must go through the ETL pipeline:
   - **Extract**: Web scrapers fetch raw data from websites
   - **Transform**: Data is cleaned, standardized, and formatted
   - **Load**: Processed data is stored in the database

2. **Data Quality**: By standardizing the ETL process, we ensure:
   - Consistent data formats
   - Proper data cleaning and validation
   - Reliable data storage patterns
   - Traceable data lineage

3. **Separation of Concerns**: ETL operations are isolated from:
   - API endpoints (ETL doesn't call API)
   - Channel logic (ETL doesn't post to channels)
   - RAG processing (ETL only stores data; RAG consumes it)

**Components**:
- **`extract/`** – Web scrapers and data extraction (the only way to get internet data)
- **`transform/`** – Data standardization, cleaning, and formatting
- **`load/`** – Database storage and indexing

**See**: [ETL README](../src/etl/README.md)

---

### 3. RAG (`src/rag/`)

**Purpose**: Retrieval-Augmented Generation logic using LangChain.

**Why this architecture?**

1. **Tool-Based Database Access**: RAG agents use **tool functions** (not direct database access):
   - Tool functions are exposed through the API
   - RAG agents call these tools when they need database operations
   - Database functions themselves are never exposed to RAG context
   - Only the **results** of database operations are returned to RAG

2. **Security**: By preventing direct database access:
   - RAG agents cannot execute arbitrary database queries
   - Access control is enforced at the API layer
   - Database schema and operations remain hidden from RAG

3. **Channel Integration**: RAG receives requests from channels and returns responses, but never directly interacts with channels.

**See**: [RAG README](../src/rag/README.md)

---

### 4. API (`src/api/`)

**Purpose**: REST API built with Fastify. Entry point for external systems and internal modules.

**Why this architecture?**

1. **Unified Interface**: All database operations and business logic are exposed through a consistent REST API
2. **Access Control**: The API layer enforces authentication and authorization
3. **Tool Functions**: Provides tool functions for RAG agents to access database operations safely
4. **Service Layer**: Business logic lives in services, which use `db_operations` for data access

**See**: [API README](../src/api/README.md)

---

### 5. Channels (`src/channels/`)

**Purpose**: Communication channel implementations (WhatsApp, Discord).

**Why this architecture?**

1. **Separation**: Channel-specific logic is isolated from business logic
2. **Delegation**: Channels delegate to API or RAG for business operations
3. **No Direct DB Access**: Channels cannot access `db_operations` directly; they must use the API

**See**: [Channels README](../src/channels/README.md)

---

## Data Flow

### User Message Flow

```
User → Channel → RAG → API (tool functions) → db_operations → Database
                ↓
            Response ← Channel ← RAG ← API ← db_operations
```

### ETL Data Flow

```
Internet → ETL Extract → ETL Transform → ETL Load → db_operations → Database
                                                          ↓
                                                    RAG consumes
```

### Database Access Flow

```
API Services → db_operations/models → Prisma → PostgreSQL
ETL Load     → db_operations/models → Prisma → PostgreSQL
RAG          → API Tool Functions → API Services → db_operations/models → Prisma → PostgreSQL
```

---

## Architectural Principles

1. **Centralization**: Database operations are centralized in `db_operations`
2. **Isolation**: RAG agents are isolated from direct database access
3. **Single Path**: ETL is the only way to ingest internet data
4. **Tool Functions**: RAG uses tool functions, not direct database access
5. **Clear Boundaries**: Each component has well-defined responsibilities and access patterns

---

## See Also

- [Project Structure (Visual)](project-structure.md) – Mermaid diagrams
- [Guardrails](../guardrails/README.md) – Development guidelines
- Component-specific READMEs in each `src/` folder
