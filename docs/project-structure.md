# Swanytello – Project structure (visual)

Render these diagrams at [mermaid.live](https://mermaid.live) or in any editor/docs tool that supports Mermaid.

**See also**: [Architecture Documentation](architecture.md) for detailed explanations of architectural decisions and component purposes.

---

## 1. Architecture (monolith)

How the main areas relate and who uses them.

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
      Routes[Routes / Controllers / Services]
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

    subgraph db_ops [Database Operations]
      Models[Models / Prisma]
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
  api --> db_ops
  etl --> db_ops
  rag -.->|tool functions| api
  api --> Log
  rag --> Log
  channels --> Log
  etl --> Log
  db_ops --> Log
```

---

## 2. Folder structure

Project root and `src/` layout. Guardrails live at root (for AI dev agents); RAG guardrails elsewhere.

```mermaid
flowchart TB
  subgraph root [Project root]
    guardrails[guardrails/]
    prisma_root[prisma/]
    docker[docker/]
  end

  subgraph src_content [src/]
    server[server.ts]
    api[api/ REST API]
    rag[rag/ RAG LangChain]
    channels[channels/]
    etl[etl/]
    db_ops[db_operations/]
    log[log/]
    types[types/]
    utils[utils/]
  end

  subgraph api_detail [api/]
    routes[routes]
    controllers[controllers]
    services[services]
    schemas[schemas]
    middleware[middleware]
  end

  subgraph channels_detail [channels/]
    whatsapp[whatsapp/]
    discord[discord/]
  end

  subgraph db_ops_detail [db_operations/]
    models[models/]
    prisma[prismaInstance.ts]
  end

  subgraph docker_detail [docker/]
    compose[docker-compose.yml]
    dockerignore[.dockerignore]
  end

  root --> guardrails
  root --> prisma_root
  root --> docker
  root --> src_content
  api --> api_detail
  channels --> channels_detail
  db_ops --> db_ops_detail
  docker --> docker_detail
```

---

## 3. Data flow (channels → API / RAG)

How messages from users reach the API and RAG.

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
