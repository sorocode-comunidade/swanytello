import { Prisma, PrismaClient } from "../../../generated/prisma/index.js";
import prismaInstance from "../prismaInstance.js";
import type {
  CreateOpenPositionInput,
  UpdateOpenPositionInput,
  QueryOpenPositionInput,
  OpenPosition,
  ColdDeleted,
} from "../db_types/open_position.schema.js";

// Type assertion for prismaInstance to ensure TypeScript recognizes Prisma models
const prisma = prismaInstance as PrismaClient;

/**
 * OpenPosition Model
 * CRUD operations for the open_position table
 * All functions validate input with Zod schemas and return validated types
 */

/**
 * Create a new open position
 * @param data - OpenPosition creation data (validated with createOpenPositionSchema)
 * @returns Created OpenPosition
 * @throws Prisma error if creation fails
 */
export async function createOpenPosition(
  data: CreateOpenPositionInput
): Promise<OpenPosition> {
  const result = await prisma.openPosition.create({
    data: {
      title: data.title,
      link: data.link,
      companyName: data.companyName,
      region: data.region,
    },
  });

  return {
    id: result.id,
    title: result.title,
    link: result.link,
    companyName: result.companyName,
    region: result.region,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Get an open position by ID
 * @param id - UUID of the open position
 * @returns OpenPosition if found, null otherwise
 */
export async function getOpenPositionById(
  id: string
): Promise<OpenPosition | null> {
  const result = await prisma.openPosition.findUnique({
    where: { id },
  });

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    title: result.title,
    link: result.link,
    companyName: result.companyName,
    region: result.region,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Get all open positions with optional filters
 * @param query - Query parameters (validated with queryOpenPositionSchema)
 * @returns Object with open positions array and total count
 */
export async function getAllOpenPositions(query: QueryOpenPositionInput): Promise<{
  data: OpenPosition[];
  total: number;
  limit: number;
  offset: number;
}> {
  const { companyName, region, search, limit, offset } = query;

  // Build where clause
  const where: Prisma.OpenPositionWhereInput = {};

  if (companyName) {
    where.companyName = {
      contains: companyName,
      mode: "insensitive",
    };
  }

  if (region) {
    where.region = {
      contains: region,
      mode: "insensitive",
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
    ];
  }

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    prisma.openPosition.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.openPosition.count({ where }),
  ]);

  return {
    data: data.map((item: {
      id: string;
      title: string;
      link: string;
      companyName: string;
      region: string;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: item.id,
      title: item.title,
      link: item.link,
      companyName: item.companyName,
      region: item.region,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    total,
    limit,
    offset,
  };
}

/**
 * Update an open position by ID
 * @param id - UUID of the open position
 * @param data - Update data (validated with updateOpenPositionSchema)
 * @returns Updated OpenPosition if found, null otherwise
 * @throws Prisma error if update fails
 */
export async function updateOpenPosition(
  id: string,
  data: UpdateOpenPositionInput
): Promise<OpenPosition | null> {
  // Check if exists
  const existing = await prisma.openPosition.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  const result = await prisma.openPosition.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.link !== undefined && { link: data.link }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.region !== undefined && { region: data.region }),
    },
  });

  return {
    id: result.id,
    title: result.title,
    link: result.link,
    companyName: result.companyName,
    region: result.region,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Delete an open position by ID (hard delete - permanently removes from database)
 * @param id - UUID of the open position
 * @returns Deleted OpenPosition if found, null otherwise
 * @throws Prisma error if deletion fails (e.g., foreign key constraint)
 */
export async function deleteOpenPosition(
  id: string
): Promise<OpenPosition | null> {
  // Check if exists
  const existing = await prisma.openPosition.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  const result = await prisma.openPosition.delete({
    where: { id },
  });

  return {
    id: result.id,
    title: result.title,
    link: result.link,
    companyName: result.companyName,
    region: result.region,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Cold delete an open position by ID
 * Moves the record from open_position table to cold_deleted table instead of permanently deleting it
 * @param id - UUID of the open position
 * @returns ColdDeleted record if found and moved, null otherwise
 * @throws Prisma error if operation fails
 */
export async function coldDeleteOpenPosition(
  id: string
): Promise<ColdDeleted | null> {
  // Check if exists
  const existing = await prisma.openPosition.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create record in cold_deleted table
    const coldDeleted = await tx.coldDeleted.create({
      data: {
        originalId: existing.id,
        title: existing.title,
        link: existing.link,
        companyName: existing.companyName,
        region: existing.region,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
        // deletedAt will be set automatically by @default(now())
      },
    });

    // Delete from open_position table
    await tx.openPosition.delete({
      where: { id },
    });

    return coldDeleted;
  });

  return {
    id: result.id,
    originalId: result.originalId,
    title: result.title,
    link: result.link,
    companyName: result.companyName,
    region: result.region,
    deletedAt: result.deletedAt,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}
