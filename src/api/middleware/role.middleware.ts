import type { FastifyRequest, FastifyReply } from "fastify";

export function requireRole(allowedRoles: string[]) {
  return async function roleMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const user = request.user;

    if (!user) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "You do not have permission to access this resource",
      });
    }
  };
}
