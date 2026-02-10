# Database Operations

This folder holds **all database operations and models** for the Swanytello monolith. This is the centralized database access layer that provides a clean interface for database operations.

## Purpose

### Why Centralize Database Operations?

1. **Single Source of Truth**: All database operations are handled in one place (`src/db_operations/`), preventing multiple independent functions from doing the same thing. This eliminates code duplication and ensures consistency across the entire project.

2. **RAG Security Through Tool Functions**: 
   - RAG agents **never** directly access database functions from `db_operations`
   - Instead, RAG uses **tool functions** exposed through the API
   - These tool functions wrap database operations, so RAG only sees the **results**, not the functions themselves
   - Database functions are **not exposed** to the RAG agent's context
   - This ensures security and prevents RAG agents from executing arbitrary database queries

3. **Consistency and Maintainability**:
   - Consistent error handling across all database operations
   - Uniform logging patterns
   - Standardized data access patterns
   - Easier maintenance and updates (change once, affects everywhere)

### Key Architectural Decision

**RAG agents use tool functions, not direct database access.** This means:
- ✅ RAG calls API tool functions when it needs database operations
- ✅ Tool functions internally use `db_operations` models
- ✅ RAG only receives the **results** of database operations
- ❌ RAG **cannot** import or directly call `db_operations` functions
- ❌ Database functions are **never** exposed to RAG context

## Structure

- **`models/`** – Database model operations (Prisma queries). One file per entity (e.g. `entity.model.ts`).
  - Models export CRUD functions with validated input/output types
  - Models import types from `db_types/` folder
- **`db_types/`** – Zod validation schemas and TypeScript types. One schema file per entity (e.g. `entity.schema.ts`).
  - Contains Zod schemas for input validation (create, update, query)
  - Contains TypeScript types inferred from schemas
  - Models import types from here for type safety
- **`prismaInstance.ts`** – Prisma client instance configuration and initialization.

## Conventions

- Use Prisma models from `models/` for all database operations.
- Keep models focused on data access only; no business logic here.
- **All model functions are `async` and return Promises** (e.g., `Promise<OpenPosition>`).
  - Always use `await` when calling model functions in `async` functions.
  - See [Understanding Promises](../../docs/libs/promises.md) for a beginner-friendly guide.
- **Schema files go in `db_types/` folder** (`db_types/{entity}.schema.ts`) with Zod schemas for:
  - Input validation (create, update, query parameters)
  - Return type inference
- **Model files go in `models/` folder** (`models/{entity}.model.ts`) with CRUD functions.
- Use Zod schemas to validate inputs before database operations.
- Export validated types from schema files using `z.infer<typeof schema>`.
- Use `src/log` for logging database operations when needed.
- Export models through `models/index.ts` and types through `db_types/index.ts` for clean imports.

### File Structure

Each entity should have:
- `db_types/{entity}.schema.ts` – Zod schemas and TypeScript types
- `models/{entity}.model.ts` – CRUD functions using Prisma

**Example**: 
- `db_types/open_position.schema.ts` – Schemas and types
- `models/open_position.model.ts` – CRUD operations

## Usage

Other modules (API, ETL) can import models from this module:

```typescript
// Import model functions
import { 
  createOpenPosition, 
  getOpenPositionById,
  getAllOpenPositions,
  updateOpenPosition,
  deleteOpenPosition,
  coldDeleteOpenPosition,
  createTagAnalisys,
  getTagAnalisysByOpenPositionId,
  updateTagAnalisys
} from "../../db_operations/models/index.js";

// Import Zod schemas for validation
import { 
  createOpenPositionSchema,
  updateOpenPositionSchema,
  queryOpenPositionSchema,
  createTagAnalisysSchema,
  updateTagAnalisysSchema
} from "../../db_operations/db_types/index.js";

// Import types
import type { 
  CreateOpenPositionInput,
  UpdateOpenPositionInput,
  OpenPosition,
  CreateTagAnalisysInput,
  TagAnalisys
} from "../../db_operations/db_types/index.js";

// Or import everything from main index (recommended)
import { 
  createOpenPosition,
  createOpenPositionSchema,
  type CreateOpenPositionInput 
} from "../../db_operations/index.js";
```

### Example: Using OpenPosition Model

```typescript
import { 
  createOpenPositionSchema, 
  createOpenPosition,
  coldDeleteOpenPosition 
} from "../../db_operations/index.js";

// Validate input with Zod schema
const validatedInput = createOpenPositionSchema.parse({
  title: "Senior Software Engineer",
  link: "https://example.com/jobs/123",
  companyName: "Tech Corp",
  region: "Remote"
});

// Create open position (returns a Promise - use 'await' to wait for result)
const newPosition = await createOpenPosition(validatedInput);
console.log(newPosition.id); // UUID

// Later: Cold delete (moves to cold_deleted table)
const deleted = await coldDeleteOpenPosition(newPosition.id);
if (deleted) {
  console.log(`Position cold deleted at ${deleted.deletedAt}`);
}
```

**Note**: All model functions return Promises. Always use `await` when calling them in `async` functions. See [Understanding Promises](../../docs/libs/promises.md) for a beginner-friendly explanation.

## Access Control

- **API** (`src/api/`) – ✅ Can access `db_operations` directly. Services import models from here.
- **ETL** (`src/etl/`) – ✅ Can access `db_operations` for loading data (persisting scraped/transformed data).
- **RAG** (`src/rag/`) – ❌ **Cannot** access `db_operations` directly. Must use API tool functions.
- **Channels** (`src/channels/`) – ❌ **Cannot** access `db_operations` directly. Must use API.

## RAG Tool Function Pattern

When RAG needs database operations, it follows this pattern:

```
RAG Agent → API Tool Function → Service → db_operations Model → Database
                                    ↓
                              Returns result only
```

**Example**:
1. RAG agent needs to get user information
2. RAG calls API tool function `getUserById(id)`
3. Tool function internally uses `db_operations/models/user.model.js`
4. Only the **result** (user data) is returned to RAG
5. RAG never sees the database function itself

This ensures proper architectural boundaries and prevents RAG agents from directly accessing the database.

## Prerequisites

**⚠️ Database must be running**: Before using `db_operations` or starting the application, ensure PostgreSQL is running:

```bash
# Start PostgreSQL with Docker Compose
docker compose -f docker/docker-compose.yml up -d postgres

# Verify it's healthy
docker compose -f docker/docker-compose.yml ps
```

See [Docker Setup](../../docs/infrastructure/docker.md) for detailed instructions.

## Available Models

### OpenPosition

CRUD operations for job openings/positions.

**Functions**:
- `createOpenPosition(data)` – Create a new open position
- `getOpenPositionById(id)` – Get position by UUID
- `getAllOpenPositions(query)` – List positions with filters (company, region, search)
- `updateOpenPosition(id, data)` – Update position by UUID
- `deleteOpenPosition(id)` – **Hard delete**: Permanently removes position from database
- `coldDeleteOpenPosition(id)` – **Cold delete**: Moves position to `cold_deleted` table (soft delete)

**Schemas**:
- `createOpenPositionSchema` – Validation for creating positions
- `updateOpenPositionSchema` – Validation for updating positions
- `queryOpenPositionSchema` – Validation for query parameters
- `openPositionSchema` – Return type validation for positions
- `coldDeletedSchema` – Return type validation for cold deleted records

**Types**:
- `CreateOpenPositionInput` – Input type for creation
- `UpdateOpenPositionInput` – Input type for updates
- `QueryOpenPositionInput` – Input type for queries
- `OpenPosition` – Return type for positions
- `ColdDeleted` – Return type for cold deleted records

### Cold Delete vs Hard Delete

**Cold Delete** (`coldDeleteOpenPosition`):
- Moves record from `open_position` to `cold_deleted` table
- Preserves all data including original timestamps
- Records can be recovered if needed
- Sets `deletedAt` timestamp automatically
- Uses database transaction for atomicity

**Hard Delete** (`deleteOpenPosition`):
- Permanently removes record from database
- Cannot be recovered
- Use with caution

**Example**:
```typescript
import { coldDeleteOpenPosition, deleteOpenPosition } from "../../db_operations/index.js";

// Cold delete (recommended for most cases)
const coldDeleted = await coldDeleteOpenPosition(positionId);
// Record moved to cold_deleted table

// Hard delete (permanent removal)
const deleted = await deleteOpenPosition(positionId);
// Record permanently removed
```

See [OpenPosition Model](./models/open_position.model.ts) for implementation details.

### TagAnalisys

CRUD operations for tag analysis of job positions. Each analysis is linked to one OpenPosition and contains three tiers of tags (arrays of tag words).

**Functions**:
- `createTagAnalisys(data)` – Create a new tag analysis for an open position
- `getTagAnalisysById(id)` – Get tag analysis by UUID
- `getTagAnalisysByOpenPositionId(openPositionId)` – Get tag analysis by open position ID
- `getAllTagAnalisys(query)` – List tag analyses with filters (tier content, presence checks)
- `updateTagAnalisys(id, data)` – Update tag analysis by UUID
- `updateTagAnalisysByOpenPositionId(openPositionId, data)` – Update tag analysis by open position ID
- `deleteTagAnalisys(id)` – **Hard delete**: Permanently removes tag analysis
- `deleteTagAnalisysByOpenPositionId(openPositionId)` – Delete tag analysis by open position ID

**Schemas**:
- `createTagAnalisysSchema` – Validation for creating tag analyses (tiers as arrays)
- `updateTagAnalisysSchema` – Validation for updating tag analyses
- `queryTagAnalisysSchema` – Validation for query parameters
- `tagAnalisysSchema` – Return type validation

**Types**:
- `CreateTagAnalisysInput` – Input type for creation (tiers as string arrays)
- `UpdateTagAnalisysInput` – Input type for updates
- `QueryTagAnalisysInput` – Input type for queries
- `TagAnalisys` – Return type (tiers as string arrays or null)

**Tier Structure**:
- Each tier (`tier1`, `tier2`, `tier3`) accepts an **array of tag words** (strings)
- Tiers are stored as JSON strings in the database but handled as arrays in code
- Helper functions `tagsArrayToString()` and `stringToTagsArray()` handle conversion
- Each tier can contain 1-50 tags, each tag 1-100 characters

**Example**:
```typescript
import { 
  createTagAnalisysSchema, 
  createTagAnalisys,
  getTagAnalisysByOpenPositionId 
} from "../../db_operations/index.js";

// Create tag analysis with arrays of tags
const tagData = createTagAnalisysSchema.parse({
  openPositionId: "position-uuid",
  tier1: ["JavaScript", "TypeScript", "Node.js"],
  tier2: ["React", "Vue.js"],
  tier3: ["PostgreSQL", "MongoDB"]
});

const analysis = await createTagAnalisys(tagData);
console.log(analysis.tier1); // ["JavaScript", "TypeScript", "Node.js"]

// Get by open position ID
const existing = await getTagAnalisysByOpenPositionId("position-uuid");
if (existing) {
  console.log(`Tier 1 tags: ${existing.tier1?.join(", ")}`);
}
```

See [TagAnalisys Model](./models/tag_analisys.model.ts) for implementation details.

## See Also

- [Prisma Guide](../../docs/libs/prisma.md) – **Start here!** Complete guide for schema changes, migrations, and Prisma commands
- [Understanding Promises](../../docs/libs/promises.md) – **Beginner-friendly guide** to Promises and async/await (why we use them)
- [Architecture Documentation](../../docs/project_structure/architecture.md) – Detailed architectural explanation
- [API README](../api/README.md) – How API uses db_operations
- [Docker Setup](../../docs/infrastructure/docker.md) – PostgreSQL setup with Docker Compose
