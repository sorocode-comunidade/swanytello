# Docker Setup

This document explains how to use Docker Compose with Swanytello.

---

## Overview

The project includes Docker configuration files in the `docker/` folder:
- `docker/docker-compose.yml` – PostgreSQL service configuration
- `docker/.dockerignore` – Docker build ignore patterns

The application itself runs on your host machine, while PostgreSQL runs in a Docker container.

**⚠️ Critical**: PostgreSQL **must** be running before starting the application with `npm run dev`. The application will fail to start if it cannot connect to the database.

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
   docker compose -f docker/docker-compose.yml up -d postgres
   ```
   Wait for PostgreSQL to be ready. Check status with:
   ```bash
   docker compose -f docker/docker-compose.yml ps
   ```
   The container should show "healthy" status before proceeding.

2. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` to match docker-compose settings:
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

### Startup Order

Always follow this order:
1. ✅ Start PostgreSQL: `docker compose -f docker/docker-compose.yml up -d postgres`
2. ✅ Wait for PostgreSQL to be healthy
3. ✅ Configure `.env` file
4. ✅ Run Prisma migrations
5. ✅ Start application: `npm run dev`

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
- **Default credentials**:
  - User: `swanytello`
  - Password: `swanytello_password`
  - Database: `swanytello`

### Environment Variables

You can customize PostgreSQL settings by setting these environment variables before running `docker compose -f docker/docker-compose.yml up`:

- `POSTGRES_USER` - PostgreSQL username (default: `swanytello`)
- `POSTGRES_PASSWORD` - PostgreSQL password (default: `swanytello_password`)
- `POSTGRES_DB` - Database name (default: `swanytello`)
- `POSTGRES_PORT` - Host port mapping (default: `5432`)

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
docker compose -f docker/docker-compose.yml up -d postgres
# Or with alias: dcp up -d postgres
```

### Stop Services
```bash
docker compose -f docker/docker-compose.yml stop postgres
# Or with alias: dcp stop postgres
```

### View Logs
```bash
docker compose -f docker/docker-compose.yml logs -f postgres
# Or with alias: dcp logs -f postgres
```

### Check Status
```bash
docker compose -f docker/docker-compose.yml ps
# Or with alias: dcp ps
```

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

```bash
docker compose -f docker/docker-compose.yml ps
```

The health check runs every 10 seconds and will show as "healthy" when PostgreSQL is ready.

---

## Troubleshooting

### Port Already in Use

If port 5432 is already in use, change it in your `.env` or environment:
```bash
export POSTGRES_PORT=5433
docker compose -f docker/docker-compose.yml up -d postgres
```

Then update your `DATABASE_URL` to use the new port.

### Connection Refused

**Common cause**: PostgreSQL is not running or not ready yet.

1. **Verify PostgreSQL is running**: `docker compose -f docker/docker-compose.yml ps`
   - Container should exist and show "healthy" status
   - If not running, start it: `docker compose -f docker/docker-compose.yml up -d postgres`
   - Wait for health check to pass (may take 10-30 seconds)

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
