# Docker Configuration

This folder contains Docker-related configuration for the Swanytello project. All Docker services are defined in one Compose file; service-specific docs live in subfolders.

---

## Layout

| Path | Purpose |
|------|---------|
| **`docker-compose.yml`** | Compose file for **PostgreSQL** and **Ollama**. Single project name `swanytello`. |
| **`postgres_docker/`** | PostgreSQL service docs and quick reference. See [postgres_docker/README.md](postgres_docker/README.md). |
| **`ollama_docker/`** | Ollama (LLM) service docs and quick reference. See [ollama_docker/README.md](ollama_docker/README.md). |
| **`.dockerignore`** | Patterns to exclude from Docker builds. |
| **`.env.example`** | Example env vars for Docker/Compose (optional). |

---

## Services

| Service | Container name | Port (host) | Purpose |
|---------|----------------|-------------|---------|
| **postgres** | `swanytello-postgres` | 5432 | Database (required for the app). |
| **ollama** | `swanytello-ollama` | 11434 | Local LLM for RAG when not using OpenAI. |

---

## Alias

**Tip**: Create an alias so you don’t need the full path every time:

```bash
alias dcp='docker compose -f docker/docker-compose.yml'
```

Run Compose from the **project root**.

---

## Common commands

```bash
# Start both services
dcp up -d

# Start only PostgreSQL (required for app)
dcp up -d postgres

# Start only Ollama (for RAG with local LLM)
dcp up -d ollama

# Status
dcp ps

# Logs
dcp logs -f postgres
dcp logs -f ollama

# Stop
dcp stop postgres
dcp stop ollama

# Or stop all:
dcp down

# Remove containers and volumes (⚠️ deletes data)
dcp down -v
```

---

## Startup order for the app

1. Start **PostgreSQL**: `dcp up -d postgres` (required for the app).
2. Optionally start **Ollama**: `dcp up -d ollama` (if using RAG with Ollama and not OpenAI).
3. Configure `.env` (e.g. `DATABASE_URL`, and for Ollama: leave `OPENAI_API_KEY` unset or set `RAG_LLM_PROVIDER=ollama`).
4. Run the app: `npm run dev`.

---

## If "container name already in use"

If a container named `swanytello-postgres` or `swanytello-ollama` already exists from another Compose project:

```bash
docker stop swanytello-postgres swanytello-ollama
docker rm swanytello-postgres swanytello-ollama
dcp up -d
```

Data in Docker volumes is kept unless you run `dcp down -v`.

---

## See also

- [Infrastructure: Docker](../docs/infrastructure/docker.md) – Full Docker setup and troubleshooting
- [Getting started](../README.md#getting-started) – Project setup
