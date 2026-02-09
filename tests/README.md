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
│   └── testDb.ts              # Database test utilities
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

### Best Practices

1. **Always clean database** in `beforeEach` to ensure test isolation
2. **Disconnect database** in `afterAll` to clean up connections
3. **Use test helpers** (`createTestOpenPosition`, etc.) for consistent test data
4. **Test both success and failure cases**
5. **Validate input/output** with Zod schemas where applicable
6. **Test edge cases** (empty arrays, null values, etc.)

---

## See Also

- [Database Operations](../src/db_operations/README.md) – Database operations documentation
- [Prisma Guide](../docs/prisma.md) – Prisma setup and usage
- [Docker Setup](../docs/docker.md) – PostgreSQL setup with Docker Compose
