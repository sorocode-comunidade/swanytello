# User endpoints

**Base path:** `/api/user`  
**Auth:** All routes require `Authorization: Bearer <JWT>` (unless `AUTH_STATUS=off` in dev).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user` | List all users or get one by `?id=` |
| POST | `/api/user` | Create a user |
| PUT | `/api/user/:id` | Update a user |
| DELETE | `/api/user/:id` | Delete a user |

---

## Common response shape (user object)

When a single user is returned (GET by id, POST, PUT, DELETE):

| Field | Type | Description |
|--------|------|-------------|
| `id` | string | Unique user id (e.g. UUID). |
| `username` | string | Login name. |
| `email` | string | Email address. |
| `name` | string | Display name. |
| `role` | string | e.g. `"USER"`, `"ADMIN"`. |
| `active` | boolean | Whether the user is active. |
| `createdAt` | string | ISO 8601 date. |
| `updatedAt` | string | ISO 8601 date. |

---

## GET /api/user

### Description

Returns either all users or a single user when `id` is provided in the query string.

### Use cases

- List users (admin, dashboards).
- Load a single user profile by id.

### Request

| Item | Value |
|------|--------|
| Method | `GET` |
| Path | `/api/user` or `/api/user?id=<userId>` |
| Headers | `Authorization: Bearer <JWT>` |

**Query (optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | If present, return only the user with this id. |

### Response cases

**200 OK – Single user** (when `?id=` is provided and user exists):

```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**200 OK – List of users** (when `id` is omitted):

```json
[
  { "id": "...", "username": "...", "email": "...", "name": "...", "role": "...", "active": true, "createdAt": "...", "updatedAt": "..." },
  ...
]
```

**404 Not Found** (when `?id=` is provided but user does not exist):

```json
{
  "error": "Not found",
  "message": "User not found"
}
```

**401 Unauthorized** – Missing or invalid token.

---

## POST /api/user

### Description

Creates a new user. Request body must include required fields; optional fields have defaults.

### Use cases

- User registration (when exposed by the app).
- Admin creating users.

### Request

| Item | Value |
|------|--------|
| Method | `POST` |
| Path | `/api/user` |
| Content-Type | `application/json` |
| Headers | `Authorization: Bearer <JWT>` |

**Body (JSON):**

| Field | Type | Required | Constraints |
|--------|------|----------|-------------|
| `username` | string | Yes | 3–50 chars |
| `email` | string | Yes | Valid email |
| `password` | string | Yes | 6–100 chars |
| `name` | string | Yes | 2–100 chars |
| `role` | string | No | Default `"USER"` |
| `active` | boolean | No | Default `true` |

### Response cases

**201 Created** – User created; body is the user object (see common shape above). Password is not returned.

**400 Bad Request** – Validation error (e.g. invalid email, short password):

```json
{
  "error": "Validation error",
  "details": [ { "path": ["email"], "message": "Invalid email" } ]
}
```

**409 Conflict** – Username or email already exists:

```json
{
  "error": "Conflict",
  "message": "User with this username or email already exists"
}
```

**401 Unauthorized** – Missing or invalid token.

---

## PUT /api/user/:id

### Description

Updates an existing user. Only provided fields are updated; omitted fields stay unchanged.

### Use cases

- User profile update (name, email, password).
- Admin changing role or active status.

### Request

| Item | Value |
|------|--------|
| Method | `PUT` |
| Path | `/api/user/:id` |
| Content-Type | `application/json` |
| Headers | `Authorization: Bearer <JWT>` |

**Path:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User id to update. |

**Body (JSON)** – All fields optional; only send fields to update:

| Field | Type | Constraints |
|--------|------|-------------|
| `username` | string | 3–50 chars |
| `email` | string | Valid email |
| `password` | string | 6–100 chars |
| `name` | string | 2–100 chars |
| `role` | string | - |
| `active` | boolean | - |

### Response cases

**200 OK** – Updated user object (common shape).

**400 Bad Request** – Validation error:

```json
{
  "error": "Validation error",
  "details": [ ... ]
}
```

**404 Not Found** – User with given `id` not found:

```json
{
  "error": "Not found",
  "message": "User not found"
}
```

**401 Unauthorized** – Missing or invalid token.

---

## DELETE /api/user/:id

### Description

Deletes the user with the given id. Response body is the deleted user object.

### Use cases

- Admin removing a user.
- Account deletion (when exposed with proper auth).

### Request

| Item | Value |
|------|--------|
| Method | `DELETE` |
| Path | `/api/user/:id` |
| Headers | `Authorization: Bearer <JWT>` |

**Path:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User id to delete. |

### Response cases

**200 OK** – Deleted user object (common shape).

**404 Not Found** – User with given `id` not found:

```json
{
  "error": "Not found",
  "message": "User not found"
}
```

**401 Unauthorized** – Missing or invalid token.

---

## Examples

```bash
# List all users
curl -s -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/api/user

# Get user by id
curl -s -H "Authorization: Bearer YOUR_JWT" "http://localhost:3000/api/user?id=USER_ID"

# Create user
curl -X POST http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","email":"jane@example.com","password":"secret123","name":"Jane Doe"}'

# Update user
curl -X PUT http://localhost:3000/api/user/USER_ID \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith"}'

# Delete user
curl -X DELETE -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/api/user/USER_ID
```
