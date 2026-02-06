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
# Start PostgreSQL
docker compose -f docker/docker-compose.yml up -d postgres
# Or with alias: dcp up -d postgres

# Check status
docker compose -f docker/docker-compose.yml ps
# Or with alias: dcp ps

# View logs
docker compose -f docker/docker-compose.yml logs -f postgres
# Or with alias: dcp logs -f postgres

# Stop PostgreSQL
docker compose -f docker/docker-compose.yml stop postgres
# Or with alias: dcp stop postgres
```

## See Also

- [Docker Setup Documentation](../docs/docker.md) – Complete Docker setup guide
- [Getting Started](../README.md#getting-started) – Project setup instructions
