import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import { DEFAULT_MAX_SIZE } from "../utils/fileStorage.js";

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL ?? (isProduction ? "warn" : "info");

const fastifyInstance = fastify({
  logger: {
    level: logLevel,
  },
});

fastifyInstance.register(fastifyMultipart, {
  limits: {
    fileSize: DEFAULT_MAX_SIZE, // 10MB, aligned with fileStorage
    files: 1,
    fields: 5,
    parts: 10,
  },
});

fastifyInstance.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "your-secret-key",
  sign: {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
  },
});

export default fastifyInstance;
