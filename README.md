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

This repository is a **monolith** with three main areas:

- **api** – REST API (Fastify). Entry point for external systems and frontends; used by channels and RAG when they need to persist or query data. See [API](src/api/README.md).
- **rag** – RAG logic using LangChain (under `src/rag`). User-facing communication goes through the channels; channels call into this layer when a message needs a RAG response. See [RAG](src/rag/README.md).
- **channels** – Communication implementations: WhatsApp and Discord (under `src/channels`). Each channel receives and sends messages on its platform and delegates business logic to the API or RAG. See [Channels](src/channels/README.md).
- **etl** – Extract, Transform, Load operations. Contains `extract/` for data extraction (web scrapers, API calls), `transform/` for data transformation and cleaning, and `load/` for data publishing (database storage, API delivery, indexing) for the RAG in `src/rag`. See [ETL](src/etl/README.md).
- **guardrails** – (At project root.) Guidelines for AI development agents (e.g. Cursor) when writing code in this repo. RAG runtime guardrails live elsewhere. See [Guardrails](guardrails/README.md).

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

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and other variables.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations (when you have a database): `npx prisma migrate dev`
5. Start the API: `npm run dev`

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

- **[API](src/api/README.md)** – REST API (Fastify); routes, controllers, services, schemas.
- **[Database Operations](src/db_operations/README.md)** – Database models and Prisma operations.
- **[RAG](src/rag/README.md)** – RAG logic using LangChain.
- **[Channels](src/channels/README.md)** – WhatsApp and Discord communication implementations.
- **[ETL](src/etl/README.md)** – Extract, Transform, Load operations: data extraction, transformation, and publishing for the RAG.
- **[Guardrails](guardrails/README.md)** – Guidelines for AI development agents (e.g. Cursor); RAG guardrails live elsewhere.
- **[Logging](src/log/README.md)** – Logging utilities; how to use `logCreate`, `logUpdate`, `logDelete`, and `logError`.
- **[Project structure (visual)](docs/project-structure.md)** – Mermaid diagrams for architecture and folder structure.
