# Docker Setup

This document explains how to use Docker Compose with Swanytello.

---

## Overview

The project includes Docker configuration in the `docker/` folder:

- **`docker/docker-compose.yml`** – Defines **PostgreSQL** (database) and **Ollama** (local LLM for RAG).
- **`docker/postgres_docker/`** – PostgreSQL-specific docs. See [postgres_docker/README.md](../../docker/postgres_docker/README.md).
- **`docker/ollama_docker/`** – Ollama-specific docs. See [ollama_docker/README.md](../../docker/ollama_docker/README.md).
- **`docker/.dockerignore`** – Docker build ignore patterns.

The application runs on your host; PostgreSQL and Ollama run in Docker containers.

**⚠️ Critical**: **PostgreSQL** must be running before `npm run dev`. **Ollama** is optional and only needed when using RAG with the local LLM (no OpenAI).

---

## Quick Start

**⚠️ Important**: You **must** start PostgreSQL with Docker Compose **before** running `npm run dev`. The application requires a running database connection to start successfully.

**💡 Tip**: To avoid typing the full path every time, you can create an alias or run commands from the project root:
```bash
alias dcp='docker compose -f docker/docker-compose.yml'
# Then use: dcp up -d postgres
```

1. **Start PostgreSQL** (required first step):
   ```bash
   # First, check if PostgreSQL is already running
   docker ps -a --filter "name=swanytello-postgres"
   
   # If container exists and is healthy, you can skip this step!
   # If not running, start it:
   docker compose -f docker/docker-compose.yml up -d postgres
   ```
   Wait for PostgreSQL to be ready. Check status with:
   ```bash
   # Check health directly (works even if container was created with old docker-compose.yml)
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   
   # Or check with docker compose (only shows containers it manages)
   docker compose -f docker/docker-compose.yml ps
   ```
   The container should show "healthy" status before proceeding.

2. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` to match docker-compose settings. You can retrieve it automatically:
     ```bash
     # Get connection string from running container
     docker exec swanytello-postgres sh -c 'echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"'
     ```
     Or manually set it to:
     ```
     DATABASE_URL="postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public"
     ```

3. **Run migrations**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start the application** (only after PostgreSQL is running):
   ```bash
   npm run dev
   ```
   
   The application will automatically check the database connection on startup:
   ```
   🔍 Checking database connection...
   
   ✅ Docker container: Running and healthy
   ✅ Database connection: Connected
      🎉 Ready to start application!
   
   🚀 Server listening at http://0.0.0.0:3000
   ```
   
   If the database is not connected, you'll see a warning with helpful instructions.

### Startup Order

Always follow this order:
1. ✅ Start PostgreSQL: `docker compose -f docker/docker-compose.yml up -d postgres`
2. ✅ (Optional) Start Ollama for RAG: `docker compose -f docker/docker-compose.yml up -d ollama` — only if using local LLM without OpenAI.
3. ✅ Wait for PostgreSQL to be healthy
4. ✅ Configure `.env` file
5. ✅ Run Prisma migrations
6. ✅ Start application: `npm run dev`

---

## Docker Compose Version

This project uses **Docker Compose v2**, which is the current standard and is included with Docker Desktop. Docker Compose v2 is maintained as part of Docker itself and doesn't have separate LTS versions.

- **Current standard**: Docker Compose v2 (plugin-based)
- **Command syntax**: `docker compose` (with space, not hyphen)
- **Your version**: Check with `docker compose version`

The `docker/docker-compose.yml` file is compatible with Docker Compose v2 and doesn't require a version field.

---

## Docker Compose Services

### PostgreSQL

- **Image**: `postgres:16-alpine`
- **Container name**: `swanytello-postgres`
- **Port**: `5432` (configurable via `POSTGRES_PORT`)
- **Default credentials**: User `swanytello`, Password `swanytello_password`, Database `swanytello`
- **Docs**: [docker/postgres_docker/README.md](../../docker/postgres_docker/README.md)

### Ollama (RAG local LLM)

- **Image**: [ollama/ollama](https://hub.docker.com/r/ollama/ollama)
- **Container name**: `swanytello-ollama`
- **Port**: `11434` (configurable via `OLLAMA_PORT`)
- **Purpose**: Local LLM for RAG when not using OpenAI. Pull models with `docker exec -it swanytello-ollama ollama run llama3` (see [ollama_docker/README.md](../../docker/ollama_docker/README.md)).
- **Docs**: [docker/ollama_docker/README.md](../../docker/ollama_docker/README.md)

### Environment Variables

You can customize PostgreSQL settings by setting these environment variables before running `docker compose -f docker/docker-compose.yml up`:

- **PostgreSQL**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` (default `5432`)
- **Ollama**: `OLLAMA_PORT` (default `11434`)

**Example**:
```bash
export POSTGRES_PASSWORD=my_secure_password
docker compose -f docker/docker-compose.yml up -d postgres
```

---

## Common Commands

**💡 Tip**: Create an alias to avoid typing the full path every time:
```bash
alias dcp='docker compose -f docker/docker-compose.yml'
```

After creating the alias, you can use shorter commands. Examples are shown with both the full command and the alias version.

### Start Services
```bash
# Start both PostgreSQL and Ollama
docker compose -f docker/docker-compose.yml up -d
# Or with alias: dcp up -d

# Start only PostgreSQL (required for app)
docker compose -f docker/docker-compose.yml up -d postgres
# Or: dcp up -d postgres

# Start only Ollama (for RAG with local LLM)
docker compose -f docker/docker-compose.yml up -d ollama
# Or: dcp up -d ollama
```

### Stop Services
```bash
docker compose -f docker/docker-compose.yml stop postgres
docker compose -f docker/docker-compose.yml stop ollama
# Or: dcp stop postgres; dcp stop ollama

# Stop and remove all project containers
docker compose -f docker/docker-compose.yml down
# Or: dcp down
```

### View Logs
```bash
docker compose -f docker/docker-compose.yml logs -f postgres
docker compose -f docker/docker-compose.yml logs -f ollama
# Or with alias: dcp logs -f postgres; dcp logs -f ollama
```

### Check Status

**Using docker compose** (only shows containers created with this docker-compose.yml):
```bash
docker compose -f docker/docker-compose.yml ps
# Or with alias: dcp ps
```

**Direct docker command** (shows all containers, including ones created with old docker-compose.yml):
```bash
docker ps -a --filter "name=swanytello-postgres"
# Or check health status:
docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
```

**Note**: If `docker compose ps` shows empty but the container exists, it was likely created with a different docker-compose.yml file. You can still use the existing container if it's healthy!

### Get Connection Information

**Retrieve PostgreSQL connection details** from the running container:

```bash
# Get formatted connection string (DATABASE_URL) - ready to copy to .env (Prisma format)
docker exec swanytello-postgres sh -c 'echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"'

# Get clean connection string (for DBeaver, pgAdmin, etc. - without Prisma-specific parameters)
docker exec swanytello-postgres sh -c 'echo "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"'

# Get individual connection details
docker exec swanytello-postgres printenv | grep POSTGRES

# Get port mapping
docker port swanytello-postgres
```

**Example output**:
```
DATABASE_URL=postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public
postgresql://swanytello:swanytello_password@localhost:5432/swanytello
POSTGRES_USER=swanytello
POSTGRES_PASSWORD=swanytello_password
POSTGRES_DB=swanytello
5432/tcp -> 0.0.0.0:5432
```

**💡 Tip**: 
- Use the first command for `.env` file (Prisma format with `?schema=public`)
- Use the second command for database tools like DBeaver, pgAdmin, etc. (clean format)

### Connect with DBeaver (or other database tools)

**Connection details**:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `swanytello` (or get it with: `docker exec swanytello-postgres printenv POSTGRES_DB`)
- **Username**: `swanytello` (or get it with: `docker exec swanytello-postgres printenv POSTGRES_USER`)
- **Password**: `swanytello_password` (or get it with: `docker exec swanytello-postgres printenv POSTGRES_PASSWORD`)

**Quick command to get all DBeaver connection details**:
```bash
docker exec swanytello-postgres sh -c 'echo "Host: localhost
Port: 5432
Database: ${POSTGRES_DB}
Username: ${POSTGRES_USER}
Password: ${POSTGRES_PASSWORD}
Connection String: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"'
```

**DBeaver setup steps**:
1. Open DBeaver → New Database Connection
2. Select **PostgreSQL**
3. Enter connection details:
   - Host: `localhost`
   - Port: `5432`
   - Database: `swanytello`
   - Username: `swanytello`
   - Password: `swanytello_password`
4. Click **Test Connection** to verify
5. Click **Finish** to save

**Note**: Make sure PostgreSQL container is running before connecting!

### Remove Container and Volumes
⚠️ **Warning**: This will delete all database data!
```bash
docker compose -f docker/docker-compose.yml down -v
# Or with alias: dcp down -v
```

### Restart PostgreSQL
```bash
docker compose -f docker/docker-compose.yml restart postgres
# Or with alias: dcp restart postgres
```

### Making the Alias Persistent

To make the alias available in all new terminal sessions, add it to your shell configuration:

**For Bash**:
```bash
echo "alias dcp='docker compose -f docker/docker-compose.yml'" >> ~/.bashrc
source ~/.bashrc
```

**For Zsh**:
```bash
echo "alias dcp='docker compose -f docker/docker-compose.yml'" >> ~/.zshrc
source ~/.zshrc
```

---

## Data Persistence

PostgreSQL data is stored in a Docker volume named `postgres_data`. This means:
- Data persists even if you stop the container
- Data is removed only if you run `docker-compose down -v`
- The volume is shared across docker-compose restarts

To backup your data:
```bash
docker compose -f docker/docker-compose.yml exec postgres pg_dump -U swanytello swanytello > backup.sql
```

To restore:
```bash
docker compose -f docker/docker-compose.yml exec -T postgres psql -U swanytello swanytello < backup.sql
```

---

## Health Checks

The PostgreSQL service includes a health check that verifies the database is ready to accept connections. You can check the health status:

**Using docker compose** (only shows containers created with this docker-compose.yml):
```bash
docker compose -f docker/docker-compose.yml ps
```

**Direct docker command** (works even if container was created with old docker-compose.yml):
```bash
docker ps -a --filter "name=swanytello-postgres"
docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
```

The health check runs every 10 seconds and will show as "healthy" when PostgreSQL is ready.

**Note**: If `docker compose ps` shows empty but the container exists and is healthy (checked with `docker ps`), the container was created with a different docker-compose.yml file. You can still use it - it's working correctly!

---

## Troubleshooting

### Container Name Already in Use

**Error**: `Error response from daemon: Conflict. The container name "/swanytello-postgres" is already in use`

**Cause**: A container with this name already exists (possibly from a previous docker-compose run or manual creation). If `docker compose ps` is empty but the container exists, it was created with a different Compose project (e.g. run from another directory). The compose file now sets a fixed project name (`name: swanytello`) so this stays consistent.

**Solution**: You have three options:

**Option 1: Use the existing container** (if it's running and healthy):
```bash
# Check if container is running directly
docker ps | grep swanytello-postgres

# Check container health
docker inspect swanytello-postgres --format '{{.State.Health.Status}}'

# If it shows "healthy", you can use it! The container is already running.
# Just verify your DATABASE_URL matches the container settings.
# No need to run 'docker compose up' - proceed with your application setup!
```

**Option 2: Remove and recreate with docker compose** (recommended so `dcp ps` / stop / up work consistently):
```bash
# From project root - stop and remove the existing container (data is in a volume and will persist)
docker stop swanytello-postgres
docker rm swanytello-postgres

# Then start with docker compose (creates container with the correct project name)
docker compose -f docker/docker-compose.yml up -d postgres
```

**Option 3: Use docker compose down** (if container was created with docker compose):
```bash
# This will stop and remove containers created by docker compose
docker compose -f docker/docker-compose.yml down

# Then start fresh
docker compose -f docker/docker-compose.yml up -d postgres
```

**Quick check**: If the container is already running and healthy, you can skip the `up` command and proceed with your application setup!

### Cannot Connect with DBeaver (or other database tools)

**Error**: Connection refused, timeout, or authentication failed in DBeaver

**Common causes and solutions**:

1. **Container is not running**:
   ```bash
   # Check if container is running
   docker ps -a --filter "name=swanytello-postgres"
   
   # If not running, start it
   docker compose -f docker/docker-compose.yml up -d postgres
   
   # Wait for health check
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   # Should output: healthy
   ```

2. **Wrong connection string format**:
   - ❌ **Don't use**: `postgresql://user:pass@localhost:5432/db?schema=public` (Prisma format)
   - ✅ **Use**: `postgresql://user:pass@localhost:5432/db` (clean format)
   - Or use individual fields in DBeaver:
     - Host: `localhost`
     - Port: `5432`
     - Database: `swanytello`
     - Username: `swanytello`
     - Password: `swanytello_password`

3. **Get correct connection details**:
   ```bash
   # Get all connection details formatted
   docker exec swanytello-postgres sh -c 'echo "Host: localhost\nPort: 5432\nDatabase: ${POSTGRES_DB}\nUsername: ${POSTGRES_USER}\nPassword: ${POSTGRES_PASSWORD}"'
   ```

4. **Verify port is accessible**:
   ```bash
   # Check port mapping
   docker port swanytello-postgres
   # Should show: 5432/tcp -> 0.0.0.0:5432
   
   # Test connection from host
   docker exec swanytello-postgres pg_isready -U swanytello
   # Should output: swanytello-postgres:5432 - accepting connections
   ```

5. **Check firewall/network**:
   - Ensure Docker is running and container is accessible
   - On WSL2: Make sure port forwarding is working
   - Try connecting with `127.0.0.1` instead of `localhost` if `localhost` doesn't work

**Quick test connection**:
```bash
# Test PostgreSQL connection from host (requires psql client)
psql -h localhost -p 5432 -U swanytello -d swanytello
# Password: swanytello_password
```

### Port Already in Use

If port 5432 is already in use, change it in your `.env` or environment:
```bash
export POSTGRES_PORT=5433
docker compose -f docker/docker-compose.yml up -d postgres
```

Then update your `DATABASE_URL` to use the new port.

### Connection Refused

**Common cause**: PostgreSQL is not running or not ready yet.

1. **Verify PostgreSQL is running**: 
   ```bash
   # Check with docker compose (only shows containers it manages)
   docker compose -f docker/docker-compose.yml ps
   
   # Or check directly (shows all containers)
   docker ps -a --filter "name=swanytello-postgres"
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   ```
   - Container should exist and show "healthy" status
   - If not running, start it: `docker compose -f docker/docker-compose.yml up -d postgres`
   - Wait for health check to pass (may take 10-30 seconds)
   - **Note**: If `docker compose ps` is empty but container exists and is healthy, it was created with a different docker-compose.yml. You can use it!

2. **Check logs**: `docker compose -f docker/docker-compose.yml logs postgres`
   - Look for any error messages
   - Verify PostgreSQL started successfully

3. **Verify `DATABASE_URL`** matches docker-compose settings:
   - Default: `postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public`
   - Check `.env` file has correct values

4. **Ensure container is healthy**: `docker compose -f docker/docker-compose.yml ps` should show "healthy"
   - If showing "starting" or "unhealthy", wait a bit longer
   - Health check runs every 10 seconds

5. **Application won't start without database**: If you see database connection errors when running `npm run dev`, PostgreSQL is not ready. Always start PostgreSQL first!

### Reset Database

To completely reset the database:
```bash
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d postgres
npx prisma migrate dev
```

---

## Production Considerations

⚠️ **The `docker/docker-compose.yml` file is for development only.**

For production:
- Use strong passwords (set via environment variables)
- Configure proper network security
- Use managed database services (AWS RDS, Google Cloud SQL, etc.)
- Set up proper backup strategies
- Configure connection pooling
- Use environment-specific configuration

---

## See Also

- [Getting Started](../README.md#getting-started) – Main setup instructions
- [Prisma Documentation](https://www.prisma.io/docs) – Database migrations and schema management
