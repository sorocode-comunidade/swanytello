# Docker Configuration

This folder contains Docker-related configuration files for the Swanytello project.

## Files

- **`docker-compose.yml`** – Docker Compose configuration for PostgreSQL service
- **`.dockerignore`** – Patterns to exclude from Docker builds

## Usage

**💡 Tip**: Create an alias to avoid typing the full path every time:
```bash
alias dcp='docker compose -f docker/docker-compose.yml'
```

All Docker Compose commands should reference this folder. Examples show both full command and alias:

```bash
# Check if PostgreSQL is already running (do this first!)
docker compose -f docker/docker-compose.yml ps
# Or with alias: dcp ps

# Start PostgreSQL (only if not already running)
docker compose -f docker/docker-compose.yml up -d postgres
# Or with alias: dcp up -d postgres

# View logs
docker compose -f docker/docker-compose.yml logs -f postgres
# Or with alias: dcp logs -f postgres

# Stop PostgreSQL
docker compose -f docker/docker-compose.yml stop postgres
# Or with alias: dcp stop postgres

# Remove container (if you get "name already in use" error)
docker compose -f docker/docker-compose.yml down
# Or with alias: dcp down
```

**Important**: Always run Compose commands from the **project root** (e.g. `~/projects/sorocode_community/swanytello`), or use the `-f docker/docker-compose.yml` path. The compose file sets a fixed project name (`swanytello`) so that `dcp ps`, `dcp stop`, and `dcp up` always see the same container no matter where you run them.

### If "container name already in use" or Compose says no container exists

This happens when a container named `swanytello-postgres` already exists but was created with a different Compose project (e.g. run from another directory). One-time fix:

```bash
# From project root - stop and remove the existing container (data is in a volume and will persist)
docker stop swanytello-postgres
docker rm swanytello-postgres

# Start again with Compose (it will create a new container with the correct project)
docker compose -f docker/docker-compose.yml up -d postgres
# Or: dcp up -d postgres
```

After that, `dcp ps`, `dcp stop postgres`, and `dcp up -d postgres` will work consistently.

## See Also

- [Docker Setup Documentation](../docs/infrastructure/docker.md) – Complete Docker setup guide
- [Getting Started](../README.md#getting-started) – Project setup instructions
