import prismaInstance from "../plugins/prismaInstance.js";
import type { CreateUserInput, UpdateUserInput } from "../schemas/user.schema.js";

export async function getUsers() {
  return prismaInstance.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  return prismaInstance.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return prismaInstance.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: CreateUserInput) {
  return prismaInstance.user.create({
    data,
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prismaInstance.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string) {
  return prismaInstance.user.delete({
    where: { id },
  });
}
