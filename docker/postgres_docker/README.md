# PostgreSQL (Docker)

PostgreSQL service for Swanytello. Defined in the main [docker-compose.yml](../docker-compose.yml) as the `postgres` service.

---

## Quick reference

| Item | Value |
|------|--------|
| **Container name** | `swanytello-postgres` |
| **Image** | `postgres:16-alpine` |
| **Port** | `5432` (host) → `5432` (container). Override with `POSTGRES_PORT` in `.env` or environment. |
| **Default user** | `swanytello` |
| **Default password** | `swanytello_password` |
| **Default database** | `swanytello` |

---

## Start / stop

From the **project root**:

```bash
# Start PostgreSQL only
docker compose -f docker/docker-compose.yml up -d postgres
# Or with alias: dcp up -d postgres

# Stop
docker compose -f docker/docker-compose.yml stop postgres
# Or: dcp stop postgres

# Logs
docker compose -f docker/docker-compose.yml logs -f postgres
# Or: dcp logs -f postgres
```

---

## Connection string

When the app runs on the host (e.g. `npm run dev`), use in `.env`:

```
DATABASE_URL="postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public"
```

Or get it from the running container:

```bash
docker exec swanytello-postgres sh -c 'echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"'
```

---

## See also

- [Docker README](../README.md) – Main Docker usage and alias (`dcp`)
- [Infrastructure: Docker](../../docs/infrastructure/docker.md) – Full setup and troubleshooting
