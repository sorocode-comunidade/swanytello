import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import mainProtectedRoutes from "../../src/api/routes/mainProtected.routes.js";
import { DEFAULT_MAX_SIZE } from "../../src/utils/fileStorage.js";
import type { FastifyInstance } from "fastify";

/**
 * Builds a Fastify instance for API tests with JWT and protected routes.
 * Use with app.inject() for request tests. Call app.close() in afterAll.
 */
export async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(fastifyMultipart, {
    limits: { fileSize: DEFAULT_MAX_SIZE, files: 1, fields: 5, parts: 10 },
  });
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "test-secret",
    sign: {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
    },
  });

  await app.register(mainProtectedRoutes, { prefix: "/api" });
  return app;
}
