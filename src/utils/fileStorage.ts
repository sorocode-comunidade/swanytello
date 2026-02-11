import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";

/** Upload directory: from env UPLOAD_DIR or project root / uploads */
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

/** Allowed MIME type → file extensions */
const ALLOWED_EXTENSIONS = new Map<string, string[]>([
  ["image/png", ["png"]],
  ["image/jpeg", ["jpg", "jpeg"]],
  ["application/pdf", ["pdf"]],
]);

const ALLOWED_MIME_TYPES = Array.from(ALLOWED_EXTENSIONS.keys());

/** Default max file size: 10MB */
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

/**
 * Ensure a directory exists (creates recursively).
 * @throws Error if directory creation fails
 */
export async function ensureUploadDirectory(directoryPath: string): Promise<void> {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    throw new Error(
      `Failed to create upload directory: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate a unique filename: {entityType}-{timestamp}-{random}.{ext}
 */
export function generateUniqueFileName(
  originalFileName: string,
  entityType: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = getFileExtension(originalFileName);
  return `${entityType}-${timestamp}-${random}.${ext}`;
}

/**
 * Get file extension from filename (lowercase, no leading dot).
 */
export function getFileExtension(fileName: string): string {
  return path.extname(fileName).toLowerCase().replace(".", "");
}

/**
 * Sanitize filename to prevent path traversal and dangerous characters.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[/\\?%*:|"<>]/g, "")
    .replace(/\.\./g, "")
    .trim();
}

/**
 * Validate file type: MIME must be allowed and extension must match.
 */
export function validateFileType(
  mimeType: string,
  fileName: string,
  allowedTypes?: string[]
): boolean {
  const allowed = allowedTypes ?? ALLOWED_MIME_TYPES;
  if (!allowed.includes(mimeType)) return false;
  const ext = getFileExtension(fileName).toLowerCase();
  const validExtensions = ALLOWED_EXTENSIONS.get(mimeType) ?? [];
  return validExtensions.includes(ext);
}

/**
 * Validate file size against max (default 10MB).
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number = DEFAULT_MAX_SIZE
): boolean {
  return fileSize <= maxSize;
}

/**
 * Resolve path for storage: temp (by session), entity/id/file, or entity base.
 */
export function getFilePath(
  entityType: string,
  entityId?: string,
  uploadSessionId?: string,
  storedFileName?: string
): string {
  if (uploadSessionId) {
    return path.join(UPLOAD_DIR, "temp", uploadSessionId);
  }
  if (entityId && storedFileName) {
    return path.join(UPLOAD_DIR, entityType, entityId, storedFileName);
  }
  return path.join(UPLOAD_DIR, entityType);
}

/**
 * Full path for a stored file (directory + filename).
 */
export function getFullFilePath(
  filePath: string,
  storedFileName: string
): string {
  return path.join(filePath, storedFileName);
}

/**
 * Save a file (stream or buffer) to disk. Creates parent directory if needed.
 * @returns Full path of the written file
 */
export async function saveFile(
  fileStream: Readable | Buffer,
  destinationPath: string,
  fileName: string
): Promise<string> {
  const fullPath = path.join(destinationPath, fileName);
  await ensureUploadDirectory(destinationPath);

  if (Buffer.isBuffer(fileStream)) {
    await fs.writeFile(fullPath, fileStream);
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    await fs.writeFile(fullPath, Buffer.concat(chunks));
  }
  return fullPath;
}

/**
 * Delete a file. Ignores ENOENT (file not found).
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}

/**
 * Delete a directory and all its contents. Ignores ENOENT.
 */
export async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}

/**
 * Check if a path exists and is accessible.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read entire file as a buffer.
 */
export async function readFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

export {
  UPLOAD_DIR,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_SIZE,
};
