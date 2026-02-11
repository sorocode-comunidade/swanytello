/**
 * User service – placeholder until user model and DB operations are implemented.
 * All functions throw so callers do not get invalid data.
 */
import type { CreateUserData, UpdateUserData } from "../../types/user.types.js";
import type { UserResponse } from "../../types/user.types.js";

const NOT_IMPLEMENTED = "User service not implemented";

export async function getAllUsers(_requestUserId?: string): Promise<UserResponse[]> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function getUserById(
  _id: string,
  _requestUserId?: string
): Promise<UserResponse | null> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function createNewUser(
  _userData: CreateUserData,
  _createdByUserId?: string
): Promise<UserResponse> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function updateUser(
  _id: string,
  _userData: UpdateUserData,
  _updatedByUserId?: string
): Promise<UserResponse> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function deleteUser(
  _id: string,
  _deletedByUserId?: string
): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}
