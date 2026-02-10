import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { buildTestApp } from "../helpers/buildTestApp.js";
import type { FastifyInstance } from "fastify";

vi.mock("../../src/rag/chains/chat.chain.js", () => ({
  runChatChain: vi.fn().mockResolvedValue("Mocked RAG reply"),
}));

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
    it("should return 200 and reply when authenticated with valid body", async () => {
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
          "content-type": "application/json",
        },
        payload: { message: "Hello" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("reply");
      expect(body.reply).toBe("Mocked RAG reply");
      expect(body).toHaveProperty("timestamp");
      expect(typeof body.timestamp).toBe("string");
    });

    it("should return 400 when body is missing message", async () => {
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
        headers: { authorization: `Bearer ${token}` },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty("error", "Validation error");
      expect(body).toHaveProperty("details");
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
