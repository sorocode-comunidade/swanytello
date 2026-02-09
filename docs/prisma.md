# Prisma Guide

Complete guide for working with Prisma in the Swanytello project.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Workflow: Making Schema Changes](#workflow-making-schema-changes)
- [Common Commands](#common-commands)
- [Prisma 7 Specifics](#prisma-7-specifics)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project uses **Prisma 7** with PostgreSQL as the database. Prisma provides:

- **Type-safe database access** through generated Prisma Client
- **Schema-first development** via `prisma/schema.prisma`
- **Database migrations** for version control
- **Custom client output** to `generated/prisma` directory

All database operations are centralized in `src/db_operations/`. See [Database Operations](../src/db_operations/README.md) for architectural details.

---

## Prerequisites

1. **PostgreSQL must be running** (via Docker Compose):
   ```bash
   docker compose -f docker/docker-compose.yml up -d postgres
   # Verify it's healthy
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   ```

2. **Environment variables configured**:
   - Copy `.env.example` to `.env`
   - Ensure `DATABASE_URL` is set correctly. You can retrieve it from the running container:
     ```bash
     # Get connection string from PostgreSQL container
     docker exec swanytello-postgres sh -c 'echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"'
     ```
     Default: `postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public`

3. **Dependencies installed**:
   ```bash
   npm install
   ```

---

## Project Structure

```
prisma/
├── schema.prisma          # Database schema definition
└── migrations/            # Migration history (auto-generated)

prisma.config.ts          # Prisma 7 configuration (datasource URL)

generated/
└── prisma/               # Generated Prisma Client (custom output)

src/db_operations/
├── models/               # Database model operations (use Prisma Client)
├── db_types/             # Zod schemas and TypeScript types
└── prismaInstance.ts     # Prisma client instance
```

**Key Files**:
- `prisma/schema.prisma` – Define your database models here
- `prisma.config.ts` – Prisma 7 config (datasource URL from `DATABASE_URL` env var)
- `generated/prisma/` – Generated Prisma Client (don't edit manually)

---

## Workflow: Making Schema Changes

When you modify `prisma/schema.prisma`, follow this workflow:

### Step 1: Edit the Schema

Edit `prisma/schema.prisma` to add/modify models, fields, or relationships:

```prisma
model OpenPosition {
  id          String   @id @default(uuid())
  title       String
  link        String
  companyName String   @map("company_name")
  region      String
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tagAnalisys TagAnalisys?

  @@map("open_position")
}

model TagAnalisys {
  id             String   @id @default(uuid())
  openPositionId String   @unique @map("open_position_id")
  tier1          String?  @map("tier_1")  // JSON array of tags
  tier2          String?  @map("tier_2")  // JSON array of tags
  tier3          String?  @map("tier_3")  // JSON array of tags
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  openPosition OpenPosition @relation(fields: [openPositionId], references: [id], onDelete: Cascade)

  @@map("tag_analisys")
}
```

**Current Models in Schema**:
- `OpenPosition` – Job openings/positions with title, link, company name, and region
- `TagAnalisys` – Tag analysis for positions (one-to-one with OpenPosition). Contains three tiers (`tier1`, `tier2`, `tier3`) each storing arrays of tag words as JSON strings
- `ColdDeleted` – Soft-deleted records (cold delete functionality). Stores deleted OpenPosition records

**Model Relationships**:
- `OpenPosition` ↔ `TagAnalisys`: One-to-one (each position can have one tag analysis)
- `OpenPosition` → `ColdDeleted`: One-to-many (deleted positions are moved here)

**Note**: TagAnalisys tiers are stored as JSON strings in the database but handled as arrays in code. Helper functions convert between formats automatically.

### Step 2: Generate Prisma Client

After schema changes, **always** regenerate the Prisma Client:

```bash
npx prisma generate
```

**What this does**:
- Reads `prisma/schema.prisma`
- Generates TypeScript types and Prisma Client in `generated/prisma/`
- Updates type definitions used by your code

**⚠️ Important**: Run this **every time** you modify the schema, even if you haven't created a migration yet.

### Step 3: Create and Apply Migration

Create a migration to update the database schema:

```bash
# Create a new migration (interactive - prompts for name)
npx prisma migrate dev --name add_user_model

# Or create migration without applying (for review)
npx prisma migrate dev --create-only --name add_user_model
```

**What this does**:
- Creates a new migration file in `prisma/migrations/`
- Applies the migration to your database
- Regenerates Prisma Client automatically (so you can skip `npx prisma generate` if you use `migrate dev`)

**Migration workflow**:
```bash
# 1. Edit schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name descriptive_name

# The migrate dev command automatically:
# - Creates migration files
# - Applies migration to database
# - Regenerates Prisma Client
```

### Step 4: Update Your Code

After generating the client, update your model files in `src/db_operations/models/` to use the new schema:

```typescript
import { prismaInstance } from "../prismaInstance.js";

export async function createUser(data: { email: string; name?: string }) {
  return await prismaInstance.user.create({
    data,
  });
}
```

---

## Common Commands

### Schema Management

```bash
# Format schema.prisma (auto-format)
npx prisma format

# Validate schema.prisma (check for errors)
npx prisma validate

# Generate Prisma Client (after schema changes)
npx prisma generate
```

### Migrations

```bash
# Create and apply migration (development)
npx prisma migrate dev --name migration_name

# Create migration without applying (for review)
npx prisma migrate dev --create-only --name migration_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Database Introspection

```bash
# Pull schema from existing database (reverse engineering)
npx prisma db pull

# Push schema to database (no migrations, for prototyping only)
npx prisma db push
```

**⚠️ Warning**: `db push` bypasses migrations. Use `migrate dev` for production workflows.

### Prisma Studio (GUI)

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

Opens a web interface at `http://localhost:5555` to browse and edit data.

### Complete Workflow Example

```bash
# 1. Ensure PostgreSQL is running
docker compose -f docker/docker-compose.yml ps

# 2. Edit prisma/schema.prisma (add new model/field)

# 3. Format and validate schema
npx prisma format
npx prisma validate

# 4. Create and apply migration
npx prisma migrate dev --name add_new_feature

# 5. (Optional) Verify with Prisma Studio
npx prisma studio
```

---

## Prisma 7 Specifics

This project uses **Prisma 7**, which has some differences from Prisma 6:

### Configuration File (`prisma.config.ts`)

Prisma 7 uses a TypeScript config file instead of `url` in `schema.prisma`:

```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),  // Reads from .env
  },
});
```

**Key points**:
- ✅ Datasource URL is in `prisma.config.ts`, not `schema.prisma`
- ✅ Uses `env("DATABASE_URL")` to read from `.env` file
- ✅ Schema file path is specified here

### Schema File (`prisma/schema.prisma`)

In Prisma 7, the `datasource` block should **not** include `url`:

```prisma
// ✅ Correct (Prisma 7)
datasource db {
  provider = "postgresql"
  // url is in prisma.config.ts, not here
}

// ❌ Incorrect (Prisma 6 style)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Don't do this in Prisma 7
}
```

### Custom Client Output

The generator specifies a custom output path:

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../generated/prisma"  // Custom output location
  engineType = "library"
}
```

This means Prisma Client is generated in `generated/prisma/`, not the default `node_modules/.prisma/client/`.

**Import path**:
```typescript
import { PrismaClient } from "../../generated/prisma/index.js";
```

---

## Best Practices

### 1. Always Generate After Schema Changes

```bash
# After editing schema.prisma
npx prisma generate
```

Or use `migrate dev`, which does this automatically.

### 2. Use Migrations for Production

```bash
# ✅ Good: Create migrations
npx prisma migrate dev --name add_feature

# ❌ Avoid: db push (bypasses migrations)
npx prisma db push  # Only for prototyping
```

### 3. Format Schema Before Committing

```bash
npx prisma format
```

Keeps schema.prisma consistent and readable.

### 4. Validate Before Migrating

```bash
npx prisma validate
```

Catches schema errors early.

### 5. Use Descriptive Migration Names

```bash
# ✅ Good
npx prisma migrate dev --name add_user_email_unique_constraint

# ❌ Bad
npx prisma migrate dev --name update
```

### 6. Keep Models in `db_operations/models/`

All database operations should be in `src/db_operations/models/`. See [Database Operations](../src/db_operations/README.md).

### 7. Use TypeScript Types from Prisma Client

```typescript
import { Prisma } from "../../generated/prisma/index.js";

// Use generated types
type UserCreateInput = Prisma.UserCreateInput;
type UserWhereInput = Prisma.UserWhereInput;
```

---

## Troubleshooting

### "Prisma Client not generated"

**Error**: `Cannot find module '../../generated/prisma/index.js'`

**Solution**:
```bash
npx prisma generate
```

### "Migration failed"

**Error**: Migration conflicts or database connection issues

**Solutions**:
1. Check PostgreSQL is running:
   ```bash
   docker ps -a --filter "name=swanytello-postgres"
   ```

2. Verify `DATABASE_URL` in `.env`:
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://postgres:postgres@localhost:5432/swanytello
   ```

3. Reset migrations (⚠️ deletes data):
   ```bash
   npx prisma migrate reset
   ```

### "Schema validation failed"

**Error**: `P1012` or similar validation errors

**Solutions**:
1. Format schema:
   ```bash
   npx prisma format
   ```

2. Validate schema:
   ```bash
   npx prisma validate
   ```

3. Check Prisma 7 syntax (no `url` in `datasource db` block)

### "Type errors after schema change"

**Error**: TypeScript errors about missing types or properties

**Solution**:
```bash
# Regenerate Prisma Client
npx prisma generate

# Restart TypeScript server in your IDE
# VS Code/Cursor: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### "Database connection refused"

**Error**: `Can't reach database server`

**Solutions**:
1. Start PostgreSQL:
   ```bash
   docker compose -f docker/docker-compose.yml up -d postgres
   ```

2. Wait for health check:
   ```bash
   docker inspect swanytello-postgres --format '{{.State.Health.Status}}'
   # Should output: healthy
   ```

3. Check `DATABASE_URL` matches Docker Compose settings

### "Migration already applied"

**Error**: Migration exists but database is out of sync

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# If needed, mark migrations as applied (if database was modified manually)
npx prisma migrate resolve --applied migration_name
```

---

## Quick Reference

### Daily Workflow

```bash
# 1. Edit schema
vim prisma/schema.prisma

# 2. Format and validate
npx prisma format
npx prisma validate

# 3. Create migration
npx prisma migrate dev --name descriptive_name

# 4. Done! Client is regenerated automatically
```

### Check Everything is OK

```bash
# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status

# Verify database connection
npx prisma db execute --stdin <<< "SELECT 1;"
```

---

## Current Database Models

The project currently has the following models defined in `prisma/schema.prisma`:

- **`OpenPosition`** – Job openings/positions with title, link, company name, and region
  - CRUD operations: `createOpenPosition`, `getOpenPositionById`, `getAllOpenPositions`, `updateOpenPosition`, `deleteOpenPosition`, `coldDeleteOpenPosition`
  - See [OpenPosition Model](../src/db_operations/models/open_position.model.ts)

- **`TagAnalisys`** – Tag analysis for positions (one-to-one relationship with OpenPosition)
  - Contains three tiers (`tier1`, `tier2`, `tier3`) each storing arrays of tag words as JSON strings
  - CRUD operations: `createTagAnalisys`, `getTagAnalisysById`, `getTagAnalisysByOpenPositionId`, `getAllTagAnalisys`, `updateTagAnalisys`, `deleteTagAnalisys`
  - Tiers are handled as arrays in code but stored as JSON strings in the database
  - See [TagAnalisys Model](../src/db_operations/models/tag_analisys.model.ts)

- **`ColdDeleted`** – Soft-deleted records (used for cold delete functionality)
  - Stores deleted `OpenPosition` records with `deletedAt` timestamp
  - Used by `coldDeleteOpenPosition` function

**Model Relationships**:
- `OpenPosition` ↔ `TagAnalisys`: One-to-one (each position can have one tag analysis)
- `OpenPosition` → `ColdDeleted`: One-to-many (deleted positions are moved here)

See [Database Operations](../src/db_operations/README.md) for complete CRUD operations and usage examples.

## See Also

- [Database Operations](../src/db_operations/README.md) – How to use Prisma in code, including cold delete functionality
- [Docker Setup](docker.md) – PostgreSQL setup
- [Prisma Documentation](https://www.prisma.io/docs) – Official Prisma docs
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) – Prisma 7 specifics
