# Docker Configuration

This folder contains Docker-related configuration for the Swanytello project. The Compose file defines **PostgreSQL** only.

---

## Layout

| Path | Purpose |
|------|---------|
| **`docker-compose.yml`** | Compose file for **PostgreSQL**. Single project name `swanytello`. |
| **`postgres_docker/`** | PostgreSQL service docs and quick reference. See [postgres_docker/README.md](postgres_docker/README.md). |
| **`.dockerignore`** | Patterns to exclude from Docker builds. |
| **`.env.example`** | Example env vars for Docker/Compose (optional). |

---

## Services

| Service | Container name | Port (host) | Purpose |
|---------|----------------|-------------|---------|
| **postgres** | `swanytello-postgres` | 5432 | Database (required for the app). |

---

## Alias

**Tip**: Create an alias so you don't need the full path every time:

```bash
alias dcp='docker compose -f docker/docker-compose.yml'
```

Run Compose from the **project root**.

---

## Common commands

```bash
# Start PostgreSQL (required for app)
dcp up -d postgres

# Or start all defined services (postgres only)
dcp up -d

# Status
dcp ps

# Logs
dcp logs -f postgres

# Stop
dcp stop postgres

# Or stop all:
dcp down

# Remove containers and volumes (⚠️ deletes data)
dcp down -v
```

---

## Startup order for the app

1. Start **PostgreSQL**: `dcp up -d postgres` (required for the app).
2. Configure `.env` (e.g. `DATABASE_URL`).
3. Run the app: `npm run dev`.

---

## If "container name already in use"

If a container named `swanytello-postgres` already exists from another Compose project:

```bash
docker stop swanytello-postgres
docker rm swanytello-postgres
dcp up -d postgres
```

Data in Docker volumes is kept unless you run `dcp down -v`.

---

## See also

- [Infrastructure: Docker](../docs/infrastructure/docker.md) – Full Docker setup and troubleshooting
- [Getting started](../README.md#getting-started) – Project setup
