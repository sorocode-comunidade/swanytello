# Tests

Test suite for Swanytello database operations and models.

---

## Overview

This test suite uses **Vitest** for testing TypeScript code with ESM support. Tests are located in the `tests/` folder and cover database operations for all models.

---

## Prerequisites

1. **PostgreSQL must be running** (via Docker Compose):
   ```bash
   docker compose -f docker/docker-compose.yml up -d postgres
   ```

2. **Environment variables configured**:
   - Copy `.env.example` to `.env`
   - Ensure `DATABASE_URL` is set correctly

3. **Dependencies installed**:
   ```bash
   npm install
   ```

---

## Running Tests

### Run all tests
```bash
npm test
# or
npm run test:run
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

---

## Test Structure

```
tests/
├── setup.ts                    # Test environment setup
├── helpers/
│   ├── testDb.ts              # Database test utilities
│   └── buildTestApp.ts        # Fastify app for API tests (JWT + routes)
├── api/
│   └── rag.test.ts            # RAG API endpoint tests (POST /api/rag/test, /api/rag/chat)
├── rag/
│   └── llms/
│       ├── ollama-cloud.llm.test.ts  # Ollama Cloud LLM (getOllamaCloudChat, invoke)
│       └── index.test.ts              # Provider selection (getRagProvider, getChatModel, default ollama-cloud)
├── utils/
│   └── fileStorage.test.ts    # File storage helpers (paths, validation, save/delete)
└── db_operations/
    ├── open_position.test.ts  # OpenPosition CRUD tests
    └── tag_analisys.test.ts   # TagAnalisys CRUD tests
```

---

## Test Utilities

### `tests/helpers/testDb.ts`

Helper functions for test database operations:

- `cleanDatabase()` – Cleans all test data (use in `beforeEach`)
- `createTestOpenPosition()` – Creates a test open position
- `createTestTagAnalisys()` – Creates a test tag analysis
- `disconnectDatabase()` – Disconnects from database (use in `afterAll`)

**Example**:
```typescript
import { cleanDatabase, createTestOpenPosition, disconnectDatabase } from "../helpers/testDb.js";

describe("My Tests", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("should test something", async () => {
    const testPosition = await createTestOpenPosition();
    // ... test code
  });
});
```

---

## Test Coverage

### OpenPosition Tests

- ✅ Create open position
- ✅ Get by ID
- ✅ Get all with filters (company, region, search)
- ✅ Update open position
- ✅ Delete open position (hard delete)
- ✅ Cold delete open position
- ✅ Input validation with Zod schemas
- ✅ Pagination
- ✅ Error handling (non-existent IDs)

### TagAnalisys Tests

- ✅ Create tag analysis with tier arrays
- ✅ Get by ID
- ✅ Get by open position ID
- ✅ Get all with filters
- ✅ Update by ID
- ✅ Update by open position ID
- ✅ Delete by ID
- ✅ Delete by open position ID
- ✅ Array-to-JSON conversion
- ✅ Tier validation

### API Tests (RAG)

- ✅ POST `/api/rag/test` returns 200 and stub body when authenticated (JWT)
- ✅ POST `/api/rag/test` returns 401 when no `Authorization` header
- ✅ POST `/api/rag/test` returns 401 when token is invalid
- ✅ POST `/api/rag/chat` multipart message and validation

API tests use `tests/helpers/buildTestApp.ts` to build a Fastify instance with JWT and protected routes, then `app.inject()` for requests. No database or running server required.

### RAG LLM Tests (`tests/rag/llms/`)

- ✅ **ollama-cloud.llm**: `getOllamaCloudChat()` returns object with `invoke`; `invoke(message)` calls client.chat with model and messages and returns `{ content }` from response (mocked `ollama` package).
- ✅ **index**: `getRagProvider()` default (no env) returns `ollama-cloud`; respects `RAG_LLM_PROVIDER` and `OPENAI_API_KEY`. `getChatModel()` returns model with `invoke` when default.

### Utils (fileStorage)

- ✅ `getFileExtension`, `sanitizeFileName`, `generateUniqueFileName`
- ✅ `validateFileType` (MIME + extension), `validateFileSize`
- ✅ `getFilePath`, `getFullFilePath`
- ✅ `ensureUploadDirectory`, `saveFile` (buffer and stream), `readFile`
- ✅ `deleteFile`, `deleteDirectory` (ENOENT no throw)
- ✅ `fileExists`, exported constants

Utils tests use a temp directory under `os.tmpdir()` and clean up in `afterAll`. No database or env required.

---

## Writing New Tests

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { yourFunction } from "../../src/your/module.js";
import { cleanDatabase, disconnectDatabase } from "../helpers/testDb.js";

describe("Your Module", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("should do something", async () => {
    // Arrange
    const input = { /* test data */ };

    // Act
    const result = await yourFunction(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.property).toBe(expectedValue);
  });
});
```

### API tests (no database)

For endpoints under `/api` (e.g. RAG), use `buildTestApp()` and `app.inject()`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "../helpers/buildTestApp.js";

describe("My API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 200 when authenticated", async () => {
    const token = app.jwt.sign({ user: { id: "...", username: "...", email: "...", role: "ADMIN" } });
    const response = await app.inject({
      method: "POST",
      url: "/api/...",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
  });
});
```

Set `process.env.AUTH_STATUS = "on"` in `beforeAll` if you need JWT to be required (so tests don’t depend on env).

### Best Practices

1. **Always clean database** in `beforeEach` to ensure test isolation (DB tests only)
2. **Disconnect database** in `afterAll` to clean up connections (DB tests only)
3. **Use test helpers** (`createTestOpenPosition`, `buildTestApp`, etc.) for consistent test data
4. **Test both success and failure cases**
5. **Validate input/output** with Zod schemas where applicable
6. **Test edge cases** (empty arrays, null values, etc.)

---

## See Also

- [Database Operations](../src/db_operations/README.md) – Database operations documentation
- [Prisma Guide](../docs/libs/prisma.md) – Prisma setup and usage
- [Docker Setup](../docs/infrastructure/docker.md) – PostgreSQL setup with Docker Compose
