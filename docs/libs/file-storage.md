# File storage utility

The file storage helpers in `src/utils/fileStorage.ts` provide safe, configurable file upload and storage for the application (e.g. user uploads, attachments). They enforce allowed types, size limits, and path safety.

---

## Location and import

- **Module**: `src/utils/fileStorage.ts`
- **Barrel**: `src/utils/index.ts` re-exports all file storage functions and constants.

```ts
import {
  saveFile,
  getFilePath,
  validateFileType,
  validateFileSize,
  ensureUploadDirectory,
  UPLOAD_DIR,
  DEFAULT_MAX_SIZE,
} from "../utils/fileStorage.js";
// or
import { saveFile, getFilePath } from "../utils/index.js";
```

---

## Configuration

| Source | Purpose |
|--------|--------|
| **UPLOAD_DIR** | Root directory for all uploads. Set via env `UPLOAD_DIR` or defaults to `{process.cwd()}/uploads`. |
| **DEFAULT_MAX_SIZE** | Default max file size (10MB). Used by `validateFileSize` when no max is passed. |
| **ALLOWED_EXTENSIONS** / **ALLOWED_MIME_TYPES** | Built-in allowlist: PNG, JPEG, PDF. Used by `validateFileType` unless you pass a custom list. |

Add to `.env` when needed:

```env
# Optional: custom upload root (default: project root / uploads)
UPLOAD_DIR=/var/app/uploads
```

---

## Main functions

| Function | Description |
|----------|-------------|
| **ensureUploadDirectory(dir)** | Creates directory recursively. Throws on failure. |
| **generateUniqueFileName(originalName, entityType)** | Returns `{entityType}-{timestamp}-{random}.{ext}`. |
| **getFileExtension(fileName)** | Extension only, lowercase, no leading dot. |
| **sanitizeFileName(fileName)** | Strips path separators, `..`, and unsafe characters. |
| **validateFileType(mimeType, fileName, allowedTypes?)** | True if MIME is allowed and extension matches. |
| **validateFileSize(size, maxSize?)** | True if `size <= maxSize` (default 10MB). |
| **getFilePath(entityType, entityId?, uploadSessionId?, storedFileName?)** | Resolves path: temp by session, or `entityType/entityId/file`. |
| **getFullFilePath(dirPath, fileName)** | `path.join(dirPath, fileName)`. |
| **saveFile(streamOrBuffer, destPath, fileName)** | Writes to disk; creates parent dir. Returns full path. |
| **deleteFile(filePath)** | Unlinks file; ignores ENOENT. |
| **deleteDirectory(dirPath)** | Removes dir and contents; ignores ENOENT. |
| **fileExists(filePath)** | Returns true if path is accessible. |
| **readFile(filePath)** | Returns file content as `Buffer`. |

---

## Usage pattern (API upload)

Typical flow in a service:

1. **Validate**: Use `validateFileType(mimeType, originalName)` and `validateFileSize(size)`.
2. **Path**: Use `getFilePath(entityType, entityId, uploadSessionId)` for temp or final dir; `generateUniqueFileName(originalName, entityType)` for the stored filename.
3. **Save**: `saveFile(streamOrBuffer, dirPath, storedFileName)`.
4. **Optional**: Persist the stored path in the DB via a model; later use `readFile` / `deleteFile` as needed.

Use `sanitizeFileName` on user-provided names before using them in paths. Prefer `generateUniqueFileName` for stored names to avoid collisions and path tricks.

---

## Security notes

- **Path traversal**: `sanitizeFileName` removes `..` and slashes; store files under `UPLOAD_DIR` and resolve paths with `getFilePath` / `getFullFilePath` only.
- **Type and size**: Always validate MIME and extension with `validateFileType` and size with `validateFileSize` before saving.
- **Sensitive ops**: For delete/move, validate that the path stays under `UPLOAD_DIR` (e.g. `path.resolve` and check prefix) so callers cannot escape.

---

## See also

- [Project structure (utils)](../project_structure/project-structure.md) – Where `utils/` and file storage sit in the repo.
- [Understanding `index.ts` Files](index-files.md) – How `src/utils/index.ts` is used for exports.
