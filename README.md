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

**Folder structure**

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
  end

  subgraph docker_detail [docker/]
    compose[docker-compose.yml]
    dockerignore[.dockerignore]
  end

  subgraph tests_detail [tests/]
    tests_setup[setup.ts]
    tests_helpers[helpers/]
    tests_db_ops[db_operations/]
  end

  root --> guardrails
  root --> prisma_root
  root --> docker
  root --> tests
  root --> src_content
  api --> api_detail
  channels --> channels_detail
  db_ops --> db_ops_detail
  etl --> etl_detail
  docker --> docker_detail
  tests --> tests_detail
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
   # First, check if PostgreSQL is already running
   docker ps | grep swanytello-postgres
   
   # If not running, start it:
   docker compose -f docker/docker-compose.yml up -d postgres
   
   # Or if you get "container name already in use" error, the container exists.
   # Check if it's healthy:
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   ```
   Wait for PostgreSQL to be ready (should show "healthy").

2. Copy `.env.example` to `.env` and set `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public"
   ```

3. Install dependencies: `npm install`

4. **Set up Prisma** (database schema and migrations):
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Create and apply initial migrations
   npx prisma migrate dev
   ```
   See [Prisma Guide](docs/prisma.md) for detailed workflow and commands.

6. **Start the API** (only after PostgreSQL is running):
   ```bash
   npm run dev
   ```
   
   The application will automatically check the database connection on startup and display the status:
   ```
   🔍 Checking database connection...
   
   ✅ Docker container: Running and healthy
   ✅ Database connection: Connected
      🎉 Ready to start application!
   
   🚀 Server listening at http://0.0.0.0:3000
   ```
   
   If the database is not connected, you'll see a warning with instructions.

### Option 2: Local PostgreSQL

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and other variables.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations (when you have a database): `npx prisma migrate dev`
5. Start the API: `npm run dev`
   
   The application will automatically check the database connection on startup and display the status in the terminal.

### Docker Compose Commands

**💡 Tip**: Create an alias to avoid typing the full path every time:
```bash
alias dcp='docker compose -f docker/docker-compose.yml'
```

After creating the alias, you can use shorter commands like `dcp up -d postgres` instead of the full path.

All commands use the `docker/` folder configuration:

```bash
# Check if PostgreSQL is already running (direct docker command - works always)
docker ps -a --filter "name=swanytello-postgres"
# Or check health:
docker inspect swanytello-postgres --format '{{.State.Health.Status}}'

# Check with docker compose (only shows containers it manages)
docker compose -f docker/docker-compose.yml ps
# Or with alias: dcp ps

# Start PostgreSQL (if not already running)
docker compose -f docker/docker-compose.yml up -d postgres
# Or with alias: dcp up -d postgres

# Stop PostgreSQL
docker compose -f docker/docker-compose.yml stop postgres
# Or with alias: dcp stop postgres

# View PostgreSQL logs
docker compose -f docker/docker-compose.yml logs -f postgres
# Or with alias: dcp logs -f postgres

# Get PostgreSQL connection information
# For .env file (Prisma format):
docker exec swanytello-postgres sh -c 'echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"'

# For DBeaver/pgAdmin (clean format):
docker exec swanytello-postgres sh -c 'echo "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"'

# Get all connection details formatted:
docker exec swanytello-postgres sh -c 'echo "Host: localhost\nPort: 5432\nDatabase: ${POSTGRES_DB}\nUsername: ${POSTGRES_USER}\nPassword: ${POSTGRES_PASSWORD}"'

# Remove PostgreSQL container and volumes (⚠️ deletes data)
docker compose -f docker/docker-compose.yml down -v
# Or with alias: dcp down -v

# Restart PostgreSQL
docker compose -f docker/docker-compose.yml restart postgres
# Or with alias: dcp restart postgres
```

**Note**: To make the alias persistent, add it to your `~/.bashrc` or `~/.zshrc`:
```bash
echo "alias dcp='docker compose -f docker/docker-compose.yml'" >> ~/.bashrc
source ~/.bashrc
```

**Troubleshooting**: 
- If you get "container name already in use" error, the container is already running. Check with `docker ps -a --filter "name=swanytello-postgres"` - if it shows "healthy", you're good to go!
- If `docker compose ps` shows empty but the container exists, it was created with a different docker-compose.yml file. Use `docker ps` to check it directly.
- See [Docker Troubleshooting](docs/docker.md#troubleshooting) for more details.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the server with hot reload (nodemon + tsx) |
| `npm run start` | Start the server (tsx) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run tests (Vitest) |
| `npm run test:run` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## Testing

Tests are located in the `tests/` folder and use **Vitest** for testing database operations.

**Prerequisites**:
- PostgreSQL must be running (via Docker Compose)
- Environment variables configured (`.env` file)

**Run tests**:
```bash
npm test
```

See [Tests Documentation](tests/README.md) for detailed information on writing and running tests.

---

## Project structure

```
├── docker/           # Docker configuration files
│   ├── docker-compose.yml
│   └── .dockerignore
├── guardrails/       # Guidelines for AI dev agents (e.g. Cursor); RAG guardrails elsewhere
├── prisma/           # Schema, migrations
├── tests/            # Test suite (Vitest)
│   ├── helpers/      # Test utilities and helpers
│   └── db_operations/ # Database operation tests
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
├── vitest.config.ts  # Vitest configuration
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

- **[Prisma Guide](docs/prisma.md)** – **Database schema workflow**: How to modify schema, generate Prisma Client, create migrations, and common commands.
- **[Docker Setup](docs/docker.md)** – Docker Compose setup for PostgreSQL and development environment.
- **[Understanding Promises](docs/promises.md)** – **Beginner-friendly guide**: Why we use Promises and async/await in JavaScript/TypeScript.
- **[Understanding `index.ts` Files](docs/index-files.md)** – **Beginner-friendly guide**: How and why we use `index.ts` files for clean imports and module organization.
- **[Troubleshooting](docs/troubleshooting.md)** – Common issues and solutions: Prisma extension, DBeaver connection, database issues.
- **[Guardrails](guardrails/README.md)** – Guidelines for AI development agents (e.g. Cursor); RAG runtime guardrails live elsewhere.
- **[Logging](src/log/README.md)** – Logging utilities; how to use `logCreate`, `logUpdate`, `logDelete`, and `logError`.
