# Swanytello – Project structure (visual)

Render these diagrams at [mermaid.live](https://mermaid.live) or in any editor/docs tool that supports Mermaid.

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
      Routes[Routes / Controllers / Services / Models]
      Fastify --> Routes
    end

    subgraph bot [Bot]
      RAG[RAG plus LangChain]
    end

    subgraph channels [Channels]
      WhatsApp[WhatsApp]
      Discord[Discord]
    end

    subgraph scrapers [Scrapers]
      Scrape[Web scrapers]
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
  channels --> bot
  scrapers --> bot
  api --> Log
  bot --> Log
  channels --> Log
  scrapers --> Log
```

---

## 2. Folder structure

Project root and `src/` layout. Guardrails live at root (for AI dev agents); RAG guardrails elsewhere.

```mermaid
flowchart TB
  subgraph root [Project root]
    guardrails[guardrails/]
    prisma_root[prisma/]
  end

  subgraph src_content [src/]
    server[server.ts]
    api[api/ REST API]
    bot[bot/ RAG LangChain]
    channels[channels/]
    scrapers[scrapers/]
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

---

## 3. Data flow (channels → API / Bot)

How messages from users reach the API and RAG.

```mermaid
sequenceDiagram
  participant User
  participant Channel as Channel (WhatsApp or Discord)
  participant API as REST API
  participant Bot as Bot (RAG)

  User->>Channel: Message
  Channel->>Bot: Need RAG response
  Bot->>Bot: LangChain / RAG
  Bot-->>Channel: Response content
  Channel->>API: Persist or query data (optional)
  API-->>Channel: Result
  Channel->>User: Reply
```
