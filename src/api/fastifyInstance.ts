import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import { DEFAULT_MAX_SIZE } from "../utils/fileStorage.js";

const fastifyInstance = fastify({
  logger: true,
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
