import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "../helpers/buildTestApp.js";
import type { FastifyInstance } from "fastify";

describe("RAG API", () => {
  let app: FastifyInstance;
  let savedAuthStatus: string | undefined;

  beforeAll(async () => {
    savedAuthStatus = process.env.AUTH_STATUS;
    process.env.AUTH_STATUS = "on"; // Enforce JWT so tests are deterministic
    app = await buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    if (savedAuthStatus !== undefined) process.env.AUTH_STATUS = savedAuthStatus;
  });

  describe("POST /api/rag/test", () => {
    it("should return 200 and stub body when authenticated", async () => {
      const token = app.jwt.sign({
        user: {
          id: "test-user-id",
          username: "testuser",
          email: "test@example.com",
          role: "ADMIN",
        },
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/rag/test",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("ok", true);
      expect(body).toHaveProperty("message");
      expect(body.message).toContain("RAG test endpoint");
      expect(body).toHaveProperty("timestamp");
      expect(typeof body.timestamp).toBe("string");
    });

    it("should return 401 when no Authorization header", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/rag/test",
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body).toHaveProperty("error", "Unauthorized");
      expect(body).toHaveProperty("message");
    });

    it("should return 401 when token is invalid", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/rag/test",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body).toHaveProperty("error", "Unauthorized");
    });
  });
});
