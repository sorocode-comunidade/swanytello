import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";

const fastifyInstance = fastify({
  logger: true,
});

fastifyInstance.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "your-secret-key",
  sign: {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
  },
});

export default fastifyInstance;
