import * as userService from "../services/user.service.js";
import type { CreateUserData, UpdateUserData } from "../../types/user.types.js";

export async function getAllUsers(requestUserId?: string) {
  const users = await userService.getAllUsers(requestUserId);
  return users;
}

export async function getUserById(id: string, requestUserId?: string) {
  const user = await userService.getUserById(id, requestUserId);
  return user;
}

export async function createNewUser(
  userData: CreateUserData,
  createdByUserId?: string
) {
  const user = await userService.createNewUser(userData, createdByUserId);
  return user;
}

export async function updateUser(
  id: string,
  userData: UpdateUserData,
  updatedByUserId?: string
) {
  const user = await userService.updateUser(id, userData, updatedByUserId);
  return user;
}

export async function deleteUser(id: string, deletedByUserId?: string) {
  const user = await userService.deleteUser(id, deletedByUserId);
  return user;
}
