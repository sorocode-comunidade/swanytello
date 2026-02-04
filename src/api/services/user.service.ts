import * as userModel from "../models/user.model.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.js";
import { logCreate, logUpdate, logDelete, logError } from "../../log/logger.js";
import type { CreateUserData, UpdateUserData } from "../../types/user.types.js";
import bcrypt from "bcrypt";

export async function getAllUsers(requestUserId?: string) {
  try {
    const users = await userModel.getUsers();
    return users;
  } catch (error) {
    await logError("User", "Failed to get users", error, requestUserId);
    throw error;
  }
}

export async function getUserById(id: string, requestUserId?: string) {
  try {
    const user = await userModel.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    await logError("User", "Failed to get user", error, requestUserId);
    throw error;
  }
}

export async function createNewUser(
  userData: CreateUserData,
  createdByUserId?: string
) {
  try {
    const validatedData = createUserSchema.parse(userData);

    const existingUser = await userModel.getUserByEmail(validatedData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await userModel.createUser({
      ...validatedData,
      password: hashedPassword,
    });

    await logCreate(
      "User",
      `New user created: ${user.email}`,
      { id: user.id, email: user.email },
      createdByUserId
    );

    const { password: _p, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    await logError("User", "Failed to create user", error, createdByUserId);
    throw error;
  }
}

export async function updateUser(
  id: string,
  userData: UpdateUserData,
  updatedByUserId?: string
) {
  try {
    const validatedData = updateUserSchema.parse(userData);

    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updateData = { ...validatedData };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await userModel.updateUser(id, updateData);

    await logUpdate(
      "User",
      `User updated: ${user.email}`,
      { id: user.id, updates: validatedData },
      updatedByUserId
    );

    const { password: _p, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    await logError("User", "Failed to update user", error, updatedByUserId);
    throw error;
  }
}

export async function deleteUser(id: string, deletedByUserId?: string) {
  try {
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const user = await userModel.deleteUser(id);

    await logDelete(
      "User",
      `User deleted: ${user.email}`,
      { id: user.id },
      deletedByUserId
    );

    const { password: _p, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    await logError("User", "Failed to delete user", error, deletedByUserId);
    throw error;
  }
}
