import type { FastifyRequest, FastifyReply } from "fastify";
import { authMiddleware } from "./auth.middleware.js";

export async function conditionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authStatus = process.env.AUTH_STATUS?.toLowerCase();

  if (authStatus === "off" || authStatus === "false") {
    request.user = {
      id: "dev-user-id",
      username: "dev",
      email: "dev@local",
      role: "ADMIN",
    };
    return;
  }

  return await authMiddleware(request, reply);
}
