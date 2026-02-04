import prismaInstance from "../api/plugins/prismaInstance.js";
import { LogLevel, LogAction } from "../../generated/prisma/index.js";

export async function logCreate(
  entity: string,
  details: string,
  data?: Record<string, unknown>,
  userId?: string
) {
  await prismaInstance.log.create({
    data: {
      level: LogLevel.SUCCESS,
      action: LogAction.CREATE,
      entity,
      details,
      data: data ?? undefined,
      userId,
    },
  });
}

export async function logUpdate(
  entity: string,
  details: string,
  data?: Record<string, unknown>,
  userId?: string
) {
  await prismaInstance.log.create({
    data: {
      level: LogLevel.INFO,
      action: LogAction.UPDATE,
      entity,
      details,
      data: data ?? undefined,
      userId,
    },
  });
}

export async function logDelete(
  entity: string,
  details: string,
  data?: Record<string, unknown>,
  userId?: string
) {
  await prismaInstance.log.create({
    data: {
      level: LogLevel.WARNING,
      action: LogAction.DELETE,
      entity,
      details,
      data: data ?? undefined,
      userId,
    },
  });
}

export async function logError(
  entity: string,
  details: string,
  error?: unknown,
  userId?: string
) {
  const errorData =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : (error as Record<string, unknown>);

  await prismaInstance.log.create({
    data: {
      level: LogLevel.ERROR,
      action: LogAction.READ,
      entity,
      details,
      data: errorData,
      userId,
    },
  });
}
