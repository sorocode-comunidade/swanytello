import type { FastifyInstance } from "fastify";
import userRoutes from "./user.routes.js";

export default async function mainProtectedRoutes(
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.register(userRoutes);
}
