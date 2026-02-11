import path from "path";
import os from "os";
import { Readable } from "stream";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_SIZE,
  UPLOAD_DIR,
  deleteDirectory,
  deleteFile,
  ensureUploadDirectory,
  fileExists,
  generateUniqueFileName,
  getFileExtension,
  getFilePath,
  getFullFilePath,
  readFile,
  saveFile,
  sanitizeFileName,
  validateFileSize,
  validateFileType,
} from "../../src/utils/fileStorage.js";

const TEST_DIR = path.join(
  os.tmpdir(),
  `swanytello-fileStorage-test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
);

describe("fileStorage", () => {
  beforeAll(async () => {
    await ensureUploadDirectory(TEST_DIR);
  });

  afterAll(async () => {
    await deleteDirectory(TEST_DIR);
  });

  describe("getFileExtension", () => {
    it("returns extension lowercase without leading dot", () => {
      expect(getFileExtension("doc.pdf")).toBe("pdf");
      expect(getFileExtension("image.PNG")).toBe("png");
      expect(getFileExtension("photo.JPEG")).toBe("jpeg");
    });

    it("returns empty string when no extension", () => {
      expect(getFileExtension("noext")).toBe("");
    });
  });

  describe("sanitizeFileName", () => {
    it("removes path separators and dangerous characters", () => {
      expect(sanitizeFileName("../../../etc/passwd")).toBe("etcpasswd");
      expect(sanitizeFileName("file?.txt")).toBe("file.txt");
      expect(sanitizeFileName("a*b|c:d")).toBe("abcd");
    });

    it("trims whitespace", () => {
      expect(sanitizeFileName("  name.png  ")).toBe("name.png");
    });
  });

  describe("generateUniqueFileName", () => {
    it("returns format entityType-timestamp-random.ext", () => {
      const name = generateUniqueFileName("photo.jpg", "user");
      expect(name).toMatch(/^user-\d+-[a-z0-9]+\.(jpg|jpeg)$/);
    });

    it("uses extension from original filename", () => {
      expect(generateUniqueFileName("x.pdf", "doc")).toMatch(/\.pdf$/);
      expect(generateUniqueFileName("x.png", "img")).toMatch(/\.png$/);
    });
  });

  describe("validateFileType", () => {
    it("returns true for allowed MIME and matching extension", () => {
      expect(validateFileType("image/png", "x.png")).toBe(true);
      expect(validateFileType("image/jpeg", "x.jpg")).toBe(true);
      expect(validateFileType("image/jpeg", "x.jpeg")).toBe(true);
      expect(validateFileType("application/pdf", "x.pdf")).toBe(true);
    });

    it("returns false for disallowed MIME", () => {
      expect(validateFileType("application/zip", "x.zip")).toBe(false);
      expect(validateFileType("text/plain", "x.txt")).toBe(false);
    });

    it("returns false when extension does not match MIME", () => {
      expect(validateFileType("image/png", "x.jpg")).toBe(false);
      expect(validateFileType("application/pdf", "x.png")).toBe(false);
    });

    it("accepts custom allowedTypes", () => {
      expect(
        validateFileType("text/plain", "x.txt", ["text/plain"])
      ).toBe(false); // extension not in ALLOWED_EXTENSIONS for text/plain
      expect(
        validateFileType("image/png", "x.png", ["image/png"])
      ).toBe(true);
    });
  });

  describe("validateFileSize", () => {
    it("returns true when size <= max", () => {
      expect(validateFileSize(0)).toBe(true);
      expect(validateFileSize(100)).toBe(true);
      expect(validateFileSize(DEFAULT_MAX_SIZE)).toBe(true);
      expect(validateFileSize(500, 1000)).toBe(true);
    });

    it("returns false when size > max", () => {
      expect(validateFileSize(DEFAULT_MAX_SIZE + 1)).toBe(false);
      expect(validateFileSize(1001, 1000)).toBe(false);
    });
  });

  describe("getFilePath", () => {
    it("returns temp path when uploadSessionId is provided", () => {
      const p = getFilePath("user", undefined, "session-123");
      expect(p).toBe(path.join(UPLOAD_DIR, "temp", "session-123"));
    });

    it("returns entity/id/file path when entityId and storedFileName provided", () => {
      const p = getFilePath("user", "id-1", undefined, "file.pdf");
      expect(p).toBe(path.join(UPLOAD_DIR, "user", "id-1", "file.pdf"));
    });

    it("returns entity base path when only entityType provided", () => {
      const p = getFilePath("user");
      expect(p).toBe(path.join(UPLOAD_DIR, "user"));
    });
  });

  describe("getFullFilePath", () => {
    it("joins path and filename", () => {
      expect(getFullFilePath("/uploads/user", "f.pdf")).toBe(
        path.join("/uploads/user", "f.pdf")
      );
    });
  });

  describe("ensureUploadDirectory", () => {
    it("creates nested directory", async () => {
      const nested = path.join(TEST_DIR, "a", "b", "c");
      await ensureUploadDirectory(nested);
      const exists = await fileExists(nested);
      expect(exists).toBe(true);
    });
  });

  describe("saveFile", () => {
    it("saves buffer and returns full path", async () => {
      const dir = path.join(TEST_DIR, "buffer");
      const content = Buffer.from("hello world");
      const fullPath = await saveFile(content, dir, "buf.txt");
      expect(fullPath).toBe(path.join(dir, "buf.txt"));
      const read = await readFile(fullPath);
      expect(read.equals(content)).toBe(true);
      await deleteFile(fullPath);
    });

    it("saves stream and returns full path", async () => {
      const dir = path.join(TEST_DIR, "stream");
      const content = "streamed content";
      const stream = Readable.from([content]);
      const fullPath = await saveFile(stream, dir, "stream.txt");
      expect(fullPath).toBe(path.join(dir, "stream.txt"));
      const read = await readFile(fullPath);
      expect(read.toString()).toBe(content);
      await deleteFile(fullPath);
    });

    it("creates parent directory when missing", async () => {
      const dir = path.join(TEST_DIR, "new", "nested");
      const fullPath = await saveFile(Buffer.from("x"), dir, "f.txt");
      expect(await fileExists(fullPath)).toBe(true);
      await deleteDirectory(path.join(TEST_DIR, "new"));
    });
  });

  describe("deleteFile", () => {
    it("removes existing file", async () => {
      const dir = path.join(TEST_DIR, "del");
      const fullPath = await saveFile(Buffer.from("x"), dir, "to-delete.txt");
      await deleteFile(fullPath);
      expect(await fileExists(fullPath)).toBe(false);
    });

    it("does not throw when file does not exist (ENOENT)", async () => {
      await expect(
        deleteFile(path.join(TEST_DIR, "nonexistent.txt"))
      ).resolves.toBeUndefined();
    });
  });

  describe("deleteDirectory", () => {
    it("removes directory and contents", async () => {
      const dir = path.join(TEST_DIR, "dir-to-remove");
      await ensureUploadDirectory(dir);
      await saveFile(Buffer.from("x"), dir, "f.txt");
      await deleteDirectory(dir);
      expect(await fileExists(dir)).toBe(false);
    });

    it("does not throw when directory does not exist (ENOENT)", async () => {
      await expect(
        deleteDirectory(path.join(TEST_DIR, "nonexistent-dir"))
      ).resolves.toBeUndefined();
    });
  });

  describe("fileExists", () => {
    it("returns true for existing path", async () => {
      const dir = path.join(TEST_DIR, "exists");
      const fullPath = await saveFile(Buffer.from("x"), dir, "f.txt");
      expect(await fileExists(fullPath)).toBe(true);
      await deleteFile(fullPath);
    });

    it("returns false for non-existing path", async () => {
      expect(await fileExists(path.join(TEST_DIR, "missing.txt"))).toBe(
        false
      );
    });
  });

  describe("readFile", () => {
    it("returns file content as buffer", async () => {
      const dir = path.join(TEST_DIR, "read");
      const content = Buffer.from("read me");
      const fullPath = await saveFile(content, dir, "r.txt");
      const read = await readFile(fullPath);
      expect(read.equals(content)).toBe(true);
      await deleteFile(fullPath);
    });
  });

  describe("constants", () => {
    it("exports UPLOAD_DIR", () => {
      expect(typeof UPLOAD_DIR).toBe("string");
      expect(UPLOAD_DIR.length).toBeGreaterThan(0);
    });

    it("exports ALLOWED_EXTENSIONS as Map", () => {
      expect(ALLOWED_EXTENSIONS).toBeInstanceOf(Map);
      expect(ALLOWED_EXTENSIONS.get("image/png")).toEqual(["png"]);
    });

    it("exports ALLOWED_MIME_TYPES as array", () => {
      expect(Array.isArray(ALLOWED_MIME_TYPES)).toBe(true);
      expect(ALLOWED_MIME_TYPES).toContain("image/png");
    });

    it("exports DEFAULT_MAX_SIZE as 10MB", () => {
      expect(DEFAULT_MAX_SIZE).toBe(10 * 1024 * 1024);
    });
  });
});
