import type { FastifyInstance } from "fastify";
import * as userController from "../controllers/user.controller.js";
import { z } from "zod";
import { conditionalAuth } from "../middleware/conditionalAuth.js";
import type { CreateUserData, UpdateUserData } from "../../types/user.types.js";

export default async function userRoutes(fastifyInstance: FastifyInstance) {
  fastifyInstance.get(
    "/user",
    { onRequest: [conditionalAuth] },
    async (request, reply) => {
      try {
        const { id } = request.query as { id?: string };

        if (id) {
          const user = await userController.getUserById(id, request.user?.id);
          return reply.send(user);
        }

        const users = await userController.getAllUsers(request.user?.id);
        return reply.send(users);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "User not found") {
            return reply.code(404).send({
              error: "Not found",
              message: "User not found",
            });
          }
        }
        throw error;
      }
    }
  );

  fastifyInstance.post(
    "/user",
    { onRequest: [conditionalAuth] },
    async (request, reply) => {
      try {
        const user = await userController.createNewUser(
          request.body as CreateUserData,
          request.user?.id
        );
        return reply.code(201).send(user);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Validation error",
            details: error.issues,
          });
        }
        if (error instanceof Error) {
          if (error.message.includes("already exists")) {
            return reply.code(409).send({
              error: "Conflict",
              message: error.message,
            });
          }
        }
        throw error;
      }
    }
  );

  fastifyInstance.put(
    "/user/:id",
    { onRequest: [conditionalAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await userController.updateUser(
          id,
          request.body as UpdateUserData,
          request.user?.id
        );
        return reply.send(user);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Validation error",
            details: error.issues,
          });
        }
        if (error instanceof Error) {
          if (error.message === "User not found") {
            return reply.code(404).send({
              error: "Not found",
              message: "User not found",
            });
          }
        }
        throw error;
      }
    }
  );

  fastifyInstance.delete(
    "/user/:id",
    { onRequest: [conditionalAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await userController.deleteUser(id, request.user?.id);
        return reply.send(user);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "User not found") {
            return reply.code(404).send({
              error: "Not found",
              message: "User not found",
            });
          }
        }
        throw error;
      }
    }
  );
}
