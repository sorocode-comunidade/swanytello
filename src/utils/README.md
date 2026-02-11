# Utils

Shared utilities used across the application.

| Module | Purpose |
|--------|---------|
| **dbPing.ts** | Database connection and Docker container status checks (e.g. at startup). |
| **fileStorage.ts** | File upload and storage: path resolution, validation (type/size), save/delete, and safe filenames. |

- **Imports**: Prefer `from "../utils/fileStorage.js"` or `from "../utils/index.js"` (see [Understanding `index.ts` Files](../../docs/libs/index-files.md)).
- **File storage**: Config (`UPLOAD_DIR`), allowed types, and usage are documented in [File storage (docs)](../../docs/libs/file-storage.md).
