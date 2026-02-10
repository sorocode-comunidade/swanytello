import type { FastifyInstance } from "fastify";
import userRoutes from "./user.routes.js";
import ragRoutes from "./rag.routes.js";

export default async function mainProtectedRoutes(
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.register(userRoutes);
  fastifyInstance.register(ragRoutes);
}
