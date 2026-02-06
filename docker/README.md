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

**Note**: If you get a "container name already in use" error, check if the container is already running with `dcp ps`. If it shows "healthy", you can use it as-is!

## See Also

- [Docker Setup Documentation](../docs/docker.md) – Complete Docker setup guide
- [Getting Started](../README.md#getting-started) – Project setup instructions
