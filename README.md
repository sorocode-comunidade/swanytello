# Swanytello

Projeto desenvolvido para a comunidade Sorocode, unindo os projetos SwanyBot e DonatelloBot.

---

## Navigation

- [Swanytello](#swanytello)
  - [Navigation](#navigation)
  - [Architecture](#architecture)
    - [Visual overview](#visual-overview)
  - [Getting started](#getting-started)
  - [Scripts](#scripts)
  - [Project structure](#project-structure)
  - [Documentation](#documentation)

---

## Architecture

This repository is a **monolith** with clear architectural boundaries and centralized operations. See [Architecture Documentation](docs/architecture.md) for detailed explanations.

### Key Components

- **db_operations** – Centralized database access layer. All database operations happen here to prevent duplication. RAG uses tool functions (not direct access) for security. See [Database Operations](src/db_operations/README.md).
- **etl** – Single data ingestion path. Web scraping is the ONLY way to retrieve internet information. All external data goes through Extract → Transform → Load pipeline. See [ETL](src/etl/README.md).
- **api** – REST API (Fastify). Entry point for external systems and frontends. Provides tool functions for RAG agents. See [API](src/api/README.md).
- **rag** – RAG logic using LangChain. Uses API tool functions for database operations (never direct access). See [RAG](src/rag/README.md).
- **channels** – Communication implementations: WhatsApp and Discord. Pure communication layer that delegates to API or RAG. See [Channels](src/channels/README.md).
- **guardrails** – (At project root.) Guidelines for AI development agents (e.g. Cursor) when writing code in this repo. RAG runtime guardrails live elsewhere. See [Guardrails](guardrails/README.md).

### Architectural Principles

1. **Centralized DB Operations**: All database operations in `db_operations/` prevent duplication
2. **RAG Security**: RAG uses tool functions, never direct database access
3. **Single ETL Path**: Web scraping is the only way to retrieve internet data
4. **Clear Boundaries**: Each component has well-defined responsibilities

### Visual overview

**Architecture (monolith)**

```mermaid
flowchart TB
  subgraph external [External]
    Frontends[Frontends]
    Systems[External systems]
    Users[Users]
  end

  subgraph monolith [Swanytello monolith]
    subgraph api [REST API]
      Fastify[Fastify]
      Routes[Routes / Controllers / Services / Models]
      Fastify --> Routes
    end

    subgraph rag [RAG]
      RAGLogic[RAG + LangChain]
    end

    subgraph channels [Channels]
      WhatsApp[WhatsApp]
      Discord[Discord]
    end

    subgraph etl [ETL]
      Extract[Extract]
      Transform[Transform]
      Load[Load]
    end

    subgraph shared [Shared]
      Log[log]
      Types[types]
      Utils[utils]
    end
  end

  Frontends --> api
  Systems --> api
  Users --> channels
  channels --> api
  channels --> rag
  etl --> rag
  api --> Log
  rag --> Log
  channels --> Log
  etl --> Log
```

**Folder structure**

```mermaid
flowchart TB
  subgraph root [Project root]
    guardrails[guardrails/]
    prisma_root[prisma/]
  end

  subgraph src_content [src/]
    server[server.ts]
    api[api/ REST API]
    rag[rag/ RAG LangChain]
    channels[channels/]
    etl[etl/]
    log[log/]
    types[types/]
    utils[utils/]
  end

  subgraph api_detail [api/]
    routes[routes]
    controllers[controllers]
    services[services]
    models[models]
    schemas[schemas]
    middleware[middleware]
    plugins[plugins]
  end

  subgraph channels_detail [channels/]
    whatsapp[whatsapp/]
    discord[discord/]
  end

  root --> guardrails
  root --> prisma_root
  root --> src_content
  api --> api_detail
  channels --> channels_detail
```

**Data flow (channels → API / RAG)**

```mermaid
sequenceDiagram
  participant User
  participant Channel as Channel (WhatsApp or Discord)
  participant API as REST API
  participant RAG as RAG

  User->>Channel: Message
  Channel->>RAG: Need RAG response
  RAG->>RAG: LangChain / RAG
  RAG-->>Channel: Response content
  Channel->>API: Persist or query data (optional)
  API-->>Channel: Result
  Channel->>User: Reply
```

---

## Getting started

### Option 1: Using Docker Compose (Recommended)

**⚠️ Important**: You **must** start PostgreSQL with Docker Compose **before** running `npm run dev`. The application requires a running database connection.

1. **Start PostgreSQL with Docker Compose** (required first step):
   ```bash
   docker compose up -d postgres
   ```
   Wait for PostgreSQL to be ready (check with `docker compose ps` - should show "healthy").

2. Copy `.env.example` to `.env` and set `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public"
   ```

3. Install dependencies: `npm install`

4. Generate Prisma client: `npx prisma generate`

5. Run migrations: `npx prisma migrate dev`

6. **Start the API** (only after PostgreSQL is running):
   ```bash
   npm run dev
   ```

### Option 2: Local PostgreSQL

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and other variables.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations (when you have a database): `npx prisma migrate dev`
5. Start the API: `npm run dev`

### Docker Compose Commands

```bash
# Start PostgreSQL
docker compose up -d postgres

# Stop PostgreSQL
docker compose stop postgres

# View PostgreSQL logs
docker compose logs -f postgres

# Remove PostgreSQL container and volumes (⚠️ deletes data)
docker compose down -v

# Check PostgreSQL health
docker compose ps
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the server with hot reload (nodemon + tsx) |
| `npm run start` | Start the server (tsx) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run type-check` | Run TypeScript type checking |

---

## Project structure

```
├── guardrails/       # Guidelines for AI dev agents (e.g. Cursor); RAG guardrails elsewhere
├── prisma/           # Schema, migrations
├── src/
│   ├── api/          # REST API (Fastify)
│   ├── rag/          # RAG logic (LangChain)
│   ├── channels/     # WhatsApp and Discord
│   │   ├── whatsapp/
│   │   └── discord/
│   ├── etl/          # Extract, Transform, Load (extract/, transform/, load/)
│   ├── db_operations/ # Database models and Prisma operations
│   ├── log/          # Logging utilities
│   ├── types/        # TypeScript types
│   ├── utils/        # Shared utilities
│   └── server.ts     # Entry point
├── prisma.config.ts
└── package.json
```

---

## Documentation

### Architecture & Design

- **[Architecture](docs/architecture.md)** – Detailed explanation of architectural decisions, component purposes, and design patterns.
- **[Project Structure (Visual)](docs/project-structure.md)** – Mermaid diagrams for architecture and folder structure.

### Components

- **[Database Operations](src/db_operations/README.md)** – Centralized database access layer. Why all DB operations are here and how RAG uses tool functions.
- **[ETL](src/etl/README.md)** – Extract, Transform, Load operations. Why web scraping is the only way to retrieve internet data.
- **[API](src/api/README.md)** – REST API (Fastify); routes, controllers, services, schemas. Tool functions for RAG.
- **[RAG](src/rag/README.md)** – RAG logic using LangChain. Tool-based database access pattern.
- **[Channels](src/channels/README.md)** – WhatsApp and Discord communication implementations.

### Development

- **[Docker Setup](docs/docker.md)** – Docker Compose setup for PostgreSQL and development environment.
- **[Guardrails](guardrails/README.md)** – Guidelines for AI development agents (e.g. Cursor); RAG runtime guardrails live elsewhere.
- **[Logging](src/log/README.md)** – Logging utilities; how to use `logCreate`, `logUpdate`, `logDelete`, and `logError`.
