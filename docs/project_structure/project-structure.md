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
      Process[Process / Scheduler]
      Extract --> Transform --> Load
      Process --> Extract
    end

    subgraph db_ops [Database Operations]
      Models[Models / Prisma]
      Types[Types / Schemas]
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
    tests[tests/]
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

  subgraph rag_detail [rag/]
    rag_index[index.ts]
    rag_tools[tools/]
    rag_chains[chains/]
    rag_llms[llms/]
  end

  subgraph channels_detail [channels/]
    whatsapp[whatsapp/]
    discord[discord/]
  end

  subgraph db_ops_detail [db_operations/]
    db_ops_index[index.ts]
    models[models/]
    db_types[db_types/]
    prisma[prismaInstance.ts]
  end

  subgraph etl_detail [etl/]
    etl_index[index.ts]
    extract[extract/]
    transform[transform/]
    load[load/]
    process[process/]
  end

  subgraph utils_detail [utils/]
    utils_index[index.ts]
    utils_db_ping[dbPing.ts]
    utils_rag_ping[ragPing.ts]
    utils_file_storage[fileStorage.ts]
  end

  subgraph docker_detail [docker/]
    compose[docker-compose.yml]
    dockerignore[.dockerignore]
    postgres_docker[postgres_docker/]
  end

  subgraph tests_detail [tests/]
    tests_setup[setup.ts]
    tests_helpers[helpers/]
    tests_api[api/]
    tests_db_ops[db_operations/]
  end

  root --> guardrails
  root --> prisma_root
  root --> docker
  root --> tests
  root --> src_content
  api --> api_detail
  rag --> rag_detail
  channels --> channels_detail
  db_ops --> db_ops_detail
  etl --> etl_detail
  utils --> utils_detail
  docker --> docker_detail
  tests --> tests_detail
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

---

## 4. RAG request flow (POST /api/rag/test or POST /api/rag/chat)

When a client calls the RAG test endpoint (JSON) or the RAG chat endpoint (multipart, optional PDF), the request flows through the API into the chat chain and the configured LLM (Ollama Cloud default or OpenAI via `getChatModel()`).

```mermaid
sequenceDiagram
  participant Client
  participant Route as rag.routes
  participant Controller as rag.controller
  participant Service as rag.service
  participant Chain as chat.chain
  participant LLM as llms (Ollama Cloud / OpenAI)

  Client->>Route: POST /api/rag/test or /api/rag/chat (message [+ PDF])
  Route->>Controller: testRag(body) or chatRag(payload, userId)
  Controller->>Service: runRagChat(body) or runRagChatWithPdf(payload)
  Service->>Service: Parse body / multipart
  Service->>Chain: runChatChain(message [, attachment])
  Chain->>LLM: getChatModel().invoke(message)
  LLM->>Chain: AIMessage content
  Chain->>Service: reply string
  Service->>Controller: { reply, timestamp }
  Controller->>Route: result
  Route->>Client: 200 + { reply, timestamp }
```

**See**: [RAG documentation](../rag.md) for usage, env vars, GET /api/rag/health, and how to change the LLM.

---

## 5. ETL process (LinkedIn jobs → open_position)

The ETL process runs **on startup** (once the server is listening) and **every 12 hours**. It extracts LinkedIn job listings, transforms them into `open_position` records, and loads them into the database (skipping duplicates by link).

```mermaid
flowchart LR
  subgraph etl_run [ETL run]
    E_Extract[extract: findLinkedInJobs]
    E_Transform[transform: linkedinToOpenPosition]
    E_Load[load: loadOpenPositions]
    E_Extract --> E_Transform --> E_Load
  end
  E_Load --> DB[(open_position table)]
  Scheduler[startScheduledJobs] --> E_Extract
```

**See**: [ETL README](../../src/etl/README.md) and [Architecture](architecture.md) (ETL section).

---

## 6. Startup sequence (DB + RAG checks and scheduler)

On startup, the server loads `.env`, runs the database and RAG connectivity checks, registers routes, listens, then starts the scheduled jobs (ETL then WhatsApp send; run once, then every 6h).

```mermaid
sequenceDiagram
  participant Server as server.ts
  participant Dotenv as dotenv
  participant DBPing as utils/dbPing
  participant RAGPing as utils/ragPing
  participant Scheduler as scheduler.ts

  Server->>Dotenv: config(.env)
  Server->>DBPing: displayDatabaseStatus()
  DBPing->>DBPing: checkDatabaseStatus()
  Server->>RAGPing: displayRagStatus()
  RAGPing->>RAGPing: checkRagStatus() (Ollama Cloud / OpenAI)
  Server->>Server: Register routes, listen
  Server->>Scheduler: startScheduledJobs()
  Scheduler->>Scheduler: run once (startup), then every 6h: ETL then WhatsApp
```

---

## 7. WhatsApp send last 12h (POST /api/whatsapp/send-open-positions-last-12h)

The API fetches open positions created in the last 12 hours from the database, then asks the WhatsApp channel to format and send them via Baileys. Used for testing the WhatsApp implementation.

```mermaid
sequenceDiagram
  participant Client
  participant Route as whatsapp.routes
  participant DB as db_operations
  participant Channel as channels/whatsapp
  participant Baileys as Baileys socket

  Client->>Route: POST /api/whatsapp/send-open-positions-last-12h (body.to optional)
  Route->>Route: toJid(body.to ?? WHATSAPP_TARGET_JID)
  Route->>DB: getOpenPositionsCreatedInLastHours(12)
  DB->>Route: OpenPosition[]
  Route->>Channel: sendPositionsListToWhatsApp(jid, positions, "Last 12h open positions (DB)")
  Channel->>Channel: format list + header
  Channel->>Baileys: sendTextMessage(jid, text)
  Baileys->>Channel: ok
  Channel->>Route: { sent: true, message }
  Route->>Client: 200 { ok, message }
```
