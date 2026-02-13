# Troubleshooting Guide

Common issues and solutions for Swanytello development.

---

## Table of Contents

- [Prisma Extension Not Showing Tables](#prisma-extension-not-showing-tables)
- [DBeaver Connection Issues](#dbeaver-connection-issues)
- [Database Connection Problems](#database-connection-problems)
- [Migration Issues](#migration-issues)
- [RAG / Ollama not reachable](#rag--ollama-not-reachable)

---

## Prisma Extension Not Showing Tables

**Symptoms**: VS Code/Cursor Prisma extension shows "No tables found" even though tables exist in the database.

### Solution Steps

1. **Verify tables exist in database**:
   ```bash
   docker exec swanytello-postgres psql -U swanytello -d swanytello -c "\dt"
   ```
   Should show: `open_position`, `tag_analisys`, `_prisma_migrations`

2. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Reload Prisma Extension**:
   - VS Code/Cursor: `Cmd/Ctrl + Shift + P` → "Prisma: Restart Language Server"
   - Or reload the window: `Cmd/Ctrl + Shift + P` → "Developer: Reload Window"

4. **Verify DATABASE_URL in .env**:
   ```bash
   cat .env | grep DATABASE_URL
   ```
   Should be: `DATABASE_URL="postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public"`

5. **Check Prisma can connect**:
   ```bash
   npx prisma migrate status
   ```
   Should show: "Database schema is up to date!"

6. **Restart TypeScript Server** (if using TypeScript):
   - `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

### Common Causes

- Prisma Client not generated after schema changes
- Extension cache needs refresh
- DATABASE_URL not properly configured
- Database not running

---

## DBeaver Connection Issues

**Symptoms**: Cannot connect to PostgreSQL database from DBeaver.

### Solution Steps

1. **Verify PostgreSQL is running**:
   ```bash
   docker ps -a --filter "name=swanytello-postgres"
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   ```
   Should show: `healthy`

2. **Get connection details**:
   ```bash
   docker exec swanytello-postgres sh -c 'echo "Host: localhost
   Port: 5432
   Database: ${POSTGRES_DB}
   Username: ${POSTGRES_USER}
   Password: ${POSTGRES_PASSWORD}"'
   ```

3. **DBeaver Connection Settings**:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `swanytello`
   - **Username**: `swanytello`
   - **Password**: `swanytello_password`
   - **Show all databases**: Unchecked (optional)

4. **Test connection**:
   - Click "Test Connection" button
   - If it fails, check error message

5. **Common DBeaver Issues**:

   **Issue: Connection refused**
   - Container not running: `docker compose -f docker/docker-compose.yml up -d postgres`
   - Wrong port: Verify with `docker port swanytello-postgres`

   **Issue: Authentication failed**
   - Wrong password: Get correct password with `docker exec swanytello-postgres printenv POSTGRES_PASSWORD`
   - Wrong username: Get correct username with `docker exec swanytello-postgres printenv POSTGRES_USER`

   **Issue: Database does not exist**
   - Wrong database name: Should be `swanytello`
   - Verify with: `docker exec swanytello-postgres printenv POSTGRES_DB`

6. **Alternative: Use connection string**:
   ```
   postgresql://swanytello:swanytello_password@localhost:5432/swanytello
   ```
   (Without `?schema=public` - that's Prisma-specific)

### WSL2 Specific Issues

If you're on WSL2 and DBeaver is on Windows:

1. **Use `127.0.0.1` instead of `localhost`**:
   - Host: `127.0.0.1` (instead of `localhost`)

2. **Check port forwarding**:
   ```bash
   netstat -an | grep 5432
   # Should show: 0.0.0.0:5432
   ```

3. **Verify Docker Desktop port forwarding**:
   - Docker Desktop → Settings → Resources → WSL Integration
   - Ensure WSL integration is enabled

---

## Database Connection Problems

**Symptoms**: Application cannot connect to database, Prisma errors, connection timeouts.

### Solution Steps

1. **Check PostgreSQL container status**:
   ```bash
   docker ps -a --filter "name=swanytello-postgres"
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   ```

2. **Verify DATABASE_URL**:
   ```bash
   # Check .env file
   cat .env | grep DATABASE_URL
   
   # Get correct connection string from container
   docker exec swanytello-postgres sh -c 'echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"'
   ```

3. **Test connection**:
   ```bash
   # Test with psql (if installed)
   psql -h localhost -p 5432 -U swanytello -d swanytello
   
   # Or test with Prisma
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```

4. **Check port availability**:
   ```bash
   docker port swanytello-postgres
   # Should show: 5432/tcp -> 0.0.0.0:5432
   ```

5. **Restart PostgreSQL** (if needed):
   ```bash
   docker compose -f docker/docker-compose.yml restart postgres
   ```

---

## Migration Issues

**Symptoms**: Migrations fail, schema out of sync, migration errors.

### Solution Steps

1. **Check migration status**:
   ```bash
   npx prisma migrate status
   ```

2. **Verify database schema matches migrations**:
   ```bash
   # List tables
   docker exec swanytello-postgres psql -U swanytello -d swanytello -c "\dt"
   
   # Check migration history
   docker exec swanytello-postgres psql -U swanytello -d swanytello -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
   ```

3. **Reset migrations** (⚠️ **WARNING**: Deletes all data):
   ```bash
   npx prisma migrate reset
   ```

4. **Create new migration**:
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```

5. **Apply pending migrations**:
   ```bash
   npx prisma migrate deploy
   ```

### Common Migration Errors

**Error: Migration already applied**
- Database has migrations that Prisma doesn't recognize
- Solution: `npx prisma migrate resolve --applied migration_name`

**Error: Database schema drift**
- Database was modified outside Prisma
- Solution: `npx prisma db pull` to sync schema, then create migration

**Error: Migration failed**
- Check PostgreSQL logs: `docker compose -f docker/docker-compose.yml logs postgres`
- Verify database connection
- Check for syntax errors in migration files

---

## Quick Diagnostic Commands

Run these to quickly diagnose issues:

```bash
# 1. Check PostgreSQL is running
docker ps -a --filter "name=swanytello-postgres"

# 2. Check health
docker inspect swanytello-postgres --format '{{.State.Health.Status}}'

# 3. List tables
docker exec swanytello-postgres psql -U swanytello -d swanytello -c "\dt"

# 4. Check Prisma connection
npx prisma migrate status

# 5. Get connection details
docker exec swanytello-postgres sh -c 'echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"'

# 6. Test database connection
docker exec swanytello-postgres pg_isready -U swanytello
```

---

## RAG / LLM not reachable

**Symptoms**: POST /api/rag/test or /api/rag/chat returns 503; GET /api/rag/health returns an error for the configured provider.

**Default provider is Ollama Cloud.** Override via `.env` by setting `OPENAI_API_KEY` (and optionally `RAG_LLM_PROVIDER=openai`) to use OpenAI instead.

### If you use Ollama Cloud (default)

1. **Check env**: Ensure `OLLAMA_CLOUD_HOST` and, if required, `OLLAMA_API_KEY` are set in `.env`. Default host is `https://api.ollama.com`.
2. **Check RAG health**: `curl -s http://localhost:3000/api/rag/health` — should return `"status": "ok"`, `"provider": "ollama-cloud"` when reachable.
3. **To use OpenAI instead**: Set `OPENAI_API_KEY` in `.env` (and optionally `RAG_LLM_PROVIDER=openai`).

---

## See Also

- [Docker Setup](docker.md) – PostgreSQL setup
- [Prisma Guide](../libs/prisma.md) – Prisma workflow and commands
- [Database Operations](../../src/db_operations/README.md) – Database operations documentation
