# Understanding Promises in JavaScript/TypeScript

A beginner-friendly guide to understanding why we use Promises in the Swanytello project.

---

## Table of Contents

- [What is a Promise?](#what-is-a-promise)
- [Why Do We Need Promises?](#why-do-we-need-promises)
- [The Problem Promises Solve](#the-problem-promises-solve)
- [Promise Syntax](#promise-syntax)
- [Async/Await: The Modern Way](#asyncawait-the-modern-way)
- [Common Patterns in Our Codebase](#common-patterns-in-our-codebase)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Examples from Swanytello](#examples-from-swanytello)

---

## What is a Promise?

A **Promise** is a JavaScript object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value.

Think of it like ordering food at a restaurant:
- You place an order (start an async operation)
- You get a receipt (a Promise)
- The receipt doesn't have your food yet, but it's a **promise** that you'll get it
- Later, the food arrives (Promise resolves) or they run out (Promise rejects)

### Key Characteristics

- **Pending**: The operation is still in progress
- **Fulfilled**: The operation completed successfully
- **Rejected**: The operation failed

---

## Why Do We Need Promises?

### The Problem: Asynchronous Operations

Many operations in web development take time:
- **Database queries** (reading/writing data)
- **API calls** (fetching data from servers)
- **File operations** (reading/writing files)
- **Network requests** (downloading/uploading data)

These operations don't complete instantly. Without Promises, JavaScript would **freeze** while waiting, making your application unresponsive.

### Example: Without Promises (Bad)

```javascript
// ❌ BAD: This would freeze the entire application
const user = database.getUserById(123); // Takes 2 seconds
console.log(user.name); // Can't run until database finishes
console.log("This message waits 2 seconds!"); // User sees nothing!
```

### Example: With Promises (Good)

```javascript
// ✅ GOOD: Application stays responsive
database.getUserById(123)
  .then(user => {
    console.log(user.name); // Runs when data arrives
  });
console.log("This message shows immediately!"); // User sees this right away
```

---

## The Problem Promises Solve

### 1. **Non-Blocking Code**

Promises allow your code to continue running while waiting for slow operations.

```javascript
// Start database query (doesn't block)
const userPromise = getUserById(123);

// This code runs immediately, doesn't wait
console.log("Loading user...");
doOtherWork();

// Handle result when it arrives
userPromise.then(user => {
  console.log("User loaded:", user.name);
});
```

### 2. **Avoiding "Callback Hell"**

Before Promises, we used callbacks, which led to deeply nested code:

```javascript
// ❌ Callback Hell (hard to read and maintain)
getUser(userId, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      getReplies(comments[0].id, (replies) => {
        // 4 levels deep! Hard to read!
        console.log(replies);
      });
    });
  });
});
```

With Promises (and async/await), code is much cleaner:

```javascript
// ✅ Clean and readable
const user = await getUser(userId);
const posts = await getPosts(user.id);
const comments = await getComments(posts[0].id);
const replies = await getReplies(comments[0].id);
console.log(replies);
```

### 3. **Better Error Handling**

Promises provide a consistent way to handle errors:

```javascript
// ✅ Clear error handling
try {
  const user = await getUser(userId);
  console.log(user.name);
} catch (error) {
  console.error("Failed to get user:", error);
  // Handle error gracefully
}
```

---

## Promise Syntax

### Creating a Promise

```javascript
const myPromise = new Promise((resolve, reject) => {
  // Do some async work
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("Operation completed!"); // Success
    } else {
      reject("Operation failed!"); // Failure
    }
  }, 1000);
});
```

### Using `.then()` and `.catch()`

```javascript
myPromise
  .then(result => {
    console.log("Success:", result);
  })
  .catch(error => {
    console.error("Error:", error);
  });
```

### Chaining Promises

```javascript
getUser(userId)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => {
    console.log(comments);
  })
  .catch(error => {
    console.error("Something went wrong:", error);
  });
```

---

## Async/Await: The Modern Way

**`async/await`** is syntactic sugar that makes Promises easier to read and write. It's what we use in the Swanytello codebase.

### Basic Syntax

```javascript
// Function must be marked as 'async'
async function getUserData(userId) {
  // 'await' waits for the Promise to resolve
  const user = await getUser(userId);
  const posts = await getPosts(user.id);
  return { user, posts };
}
```

### Key Points

1. **`async`** keyword: Makes a function return a Promise
2. **`await`** keyword: Waits for a Promise to resolve
3. **Error handling**: Use `try/catch` blocks

### Example

```javascript
async function fetchUserProfile(userId) {
  try {
    const user = await getUser(userId);
    const posts = await getPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error; // Re-throw to let caller handle it
  }
}
```

---

## Common Patterns in Our Codebase

### Pattern 1: Database Operations

All database operations in `db_operations/models/` return Promises:

```typescript
// From open_position.model.ts
export async function getOpenPositionById(
  id: string
): Promise<OpenPosition | null> {
  const result = await prisma.openPosition.findUnique({
    where: { id },
  });
  return result;
}
```

**Why**: Database queries take time. Promises let us wait for results without blocking.

### Pattern 2: Function Return Types

We explicitly type Promise returns:

```typescript
// ✅ Good: Clear that this returns a Promise
async function createOpenPosition(
  data: CreateOpenPositionInput
): Promise<OpenPosition> {
  // ...
}

// ❌ Bad: Unclear return type
function createOpenPosition(data: CreateOpenPositionInput) {
  // Is this async? We don't know!
}
```

### Pattern 3: Parallel Operations

Use `Promise.all()` to run multiple operations in parallel:

```typescript
// Run both queries at the same time (faster!)
const [data, total] = await Promise.all([
  prisma.openPosition.findMany({ where }),
  prisma.openPosition.count({ where }),
]);
```

**Why**: Instead of waiting for one, then the other (2 seconds total), we wait for both at once (1 second total).

---

## Error Handling

### Try/Catch with Async/Await

```typescript
async function safeOperation() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    // Handle error
    console.error("Operation failed:", error);
    throw error; // Re-throw if needed
  }
}
```

### Promise Chain Error Handling

```typescript
riskyOperation()
  .then(result => {
    // Success handler
    return processResult(result);
  })
  .catch(error => {
    // Error handler (catches errors from any step)
    console.error("Failed:", error);
  });
```

### Common Mistakes

```typescript
// ❌ BAD: Forgetting await
const user = getUser(userId); // This is a Promise, not the user!
console.log(user.name); // Error: user is a Promise

// ✅ GOOD: Using await
const user = await getUser(userId); // This is the actual user
console.log(user.name); // Works!
```

---

## Best Practices

### 1. Always Use `async/await` in New Code

```typescript
// ✅ Preferred: Clean and readable
async function getData() {
  const result = await fetchData();
  return result;
}

// ⚠️ Avoid: Harder to read
function getData() {
  return fetchData().then(result => result);
}
```

### 2. Type Your Promises

```typescript
// ✅ Good: Clear return type
async function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Bad: Unclear return type
async function getUser(id: string) {
  // What does this return?
}
```

### 3. Handle Errors Properly

```typescript
// ✅ Good: Proper error handling
async function createUser(data: UserData) {
  try {
    return await prisma.user.create({ data });
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error; // Let caller handle it
  }
}
```

### 4. Use `Promise.all()` for Parallel Operations

```typescript
// ✅ Good: Parallel execution
const [users, posts, comments] = await Promise.all([
  getUsers(),
  getPosts(),
  getComments(),
]);

// ❌ Bad: Sequential (slower)
const users = await getUsers();
const posts = await getPosts();
const comments = await getComments();
```

### 5. Don't Forget `await` in Async Functions

```typescript
// ❌ BAD: Missing await
async function getData() {
  return fetchData(); // Returns Promise, not data!
}

// ✅ GOOD: Using await
async function getData() {
  return await fetchData(); // Returns actual data
}
```

---

## Examples from Swanytello

### Example 1: Database Query

```typescript
// From: src/db_operations/models/open_position.model.ts

export async function getOpenPositionById(
  id: string
): Promise<OpenPosition | null> {
  // 'await' waits for database query to complete
  const result = await prisma.openPosition.findUnique({
    where: { id },
  });

  if (!result) {
    return null; // No position found
  }

  // Return the result (automatically wrapped in Promise)
  return {
    id: result.id,
    title: result.title,
    // ...
  };
}
```

**Why Promise?**: Database queries take time (network + database processing). We need to wait for the result.

### Example 5: Transaction (Cold Delete)

```typescript
// From: src/db_operations/models/open_position.model.ts

export async function coldDeleteOpenPosition(
  id: string
): Promise<ColdDeleted | null> {
  // Use transaction to ensure atomicity (all-or-nothing)
  const result = await prisma.$transaction(async (tx) => {
    // Both operations must succeed, or both are rolled back
    const coldDeleted = await tx.coldDeleted.create({ /* ... */ });
    await tx.openPosition.delete({ where: { id } });
    return coldDeleted;
  });

  return result;
}
```

**Why Promise?**: Transactions involve multiple database operations that must complete together. Promises ensure we wait for the entire transaction to finish.

### Example 3: Parallel Queries

```typescript
// From: src/db_operations/models/open_position.model.ts

export async function getAllOpenPositions(query: QueryOpenPositionInput) {
  // Run both queries in parallel (faster!)
  const [data, total] = await Promise.all([
    prisma.openPosition.findMany({ where, take: limit, skip: offset }),
    prisma.openPosition.count({ where }),
  ]);

  return { data, total, limit, offset };
}
```

**Why Promise.all()?**: Instead of waiting 2 seconds total (1s + 1s), we wait 1 second (both run simultaneously).

### Example 3: Working with Arrays (TagAnalisys)

```typescript
// From: src/db_operations/models/tag_analisys.model.ts

export async function createTagAnalisys(
  data: CreateTagAnalisysInput
): Promise<TagAnalisys> {
  // Convert arrays to JSON strings for database storage
  const result = await prisma.tagAnalisys.create({
    data: {
      openPositionId: data.openPositionId,
      tier1: tagsArrayToString(data.tier1), // Convert array to JSON string
      tier2: tagsArrayToString(data.tier2),
      tier3: tagsArrayToString(data.tier3),
    },
  });

  // Convert back to arrays for return value
  return {
    id: result.id,
    tier1: stringToTagsArray(result.tier1), // Convert JSON string back to array
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    // ...
  };
}
```

**Why Promise?**: Database operations take time. We need to wait for the create operation to complete before returning the result.

### Example 4: Error Handling

```typescript
// Example service usage

async function createPositionService(data: CreatePositionInput) {
  try {
    // Validate input
    const validated = createOpenPositionSchema.parse(data);
    
    // Create in database (returns Promise)
    const newPosition = await createOpenPosition(validated);
    
    return newPosition;
  } catch (error) {
    // Handle validation or database errors
    if (error instanceof z.ZodError) {
      throw new Error("Invalid input: " + error.message);
    }
    throw error; // Re-throw database errors
  }
}
```

---

## Summary

### Key Takeaways

1. **Promises** represent future values from async operations
2. **`async/await`** makes Promises easier to read and write
3. **Always use `await`** when calling async functions
4. **Type your Promises** with `Promise<Type>`
5. **Handle errors** with `try/catch` blocks
6. **Use `Promise.all()`** for parallel operations

### When to Use Promises

- ✅ Database operations (queries, inserts, updates)
- ✅ API calls (fetching data from servers)
- ✅ File operations (reading/writing files)
- ✅ Any operation that takes time

### When NOT to Use Promises

- ❌ Simple calculations (instant operations)
- ❌ Synchronous operations (no waiting needed)
- ❌ Operations that complete immediately

---

## Further Reading

- [MDN: Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN: Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [JavaScript.info: Promises](https://javascript.info/promise-basics)
- [TypeScript: Async Functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-7.html#async-functions)

---

## See Also

- [Database Operations](../src/db_operations/README.md) – How we use Promises in database operations
- [Prisma Guide](prisma.md) – Database operations with Prisma
- [Architecture Documentation](architecture.md) – Overall project architecture
