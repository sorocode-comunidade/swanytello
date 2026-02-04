import type { FastifyInstance } from "fastify";

export default async function mainPublicRoutes(
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
}
