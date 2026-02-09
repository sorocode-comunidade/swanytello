import { Prisma, PrismaClient } from "../../../generated/prisma/index.js";
import prismaInstance from "../prismaInstance.js";
import type {
  CreateTagAnalisysInput,
  UpdateTagAnalisysInput,
  QueryTagAnalisysInput,
  TagAnalisys,
} from "../db_types/tag_analisys.schema.js";
import {
  tagsArrayToString,
  stringToTagsArray,
} from "../db_types/tag_analisys.schema.js";

// Type assertion for prismaInstance to ensure TypeScript recognizes Prisma models
const prisma = prismaInstance as PrismaClient;

/**
 * TagAnalisys Model
 * CRUD operations for the tag_analisys table
 * All functions validate input with Zod schemas and return validated types
 * 
 * Tiers are stored as JSON strings in the database but handled as arrays in code
 */

/**
 * Create a new tag analysis
 * @param data - TagAnalisys creation data (validated with createTagAnalisysSchema)
 * @returns Created TagAnalisys
 * @throws Prisma error if creation fails
 */
export async function createTagAnalisys(
  data: CreateTagAnalisysInput
): Promise<TagAnalisys> {
  const result = await prisma.tagAnalisys.create({
    data: {
      openPositionId: data.openPositionId,
      tier1: tagsArrayToString(data.tier1),
      tier2: tagsArrayToString(data.tier2),
      tier3: tagsArrayToString(data.tier3),
    },
  });

  return {
    id: result.id,
    openPositionId: result.openPositionId,
    tier1: stringToTagsArray(result.tier1),
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Get a tag analysis by ID
 * @param id - UUID of the tag analysis
 * @returns TagAnalisys if found, null otherwise
 */
export async function getTagAnalisysById(
  id: string
): Promise<TagAnalisys | null> {
  const result = await prisma.tagAnalisys.findUnique({
    where: { id },
  });

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    openPositionId: result.openPositionId,
    tier1: stringToTagsArray(result.tier1),
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Get tag analysis by open position ID
 * @param openPositionId - UUID of the open position
 * @returns TagAnalisys if found, null otherwise
 */
export async function getTagAnalisysByOpenPositionId(
  openPositionId: string
): Promise<TagAnalisys | null> {
  const result = await prisma.tagAnalisys.findUnique({
    where: { openPositionId },
  });

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    openPositionId: result.openPositionId,
    tier1: stringToTagsArray(result.tier1),
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Get all tag analyses with optional filters
 * @param query - Query parameters (validated with queryTagAnalisysSchema)
 * @returns Object with tag analyses array and total count
 */
export async function getAllTagAnalisys(query: QueryTagAnalisysInput): Promise<{
  data: TagAnalisys[];
  total: number;
  limit: number;
  offset: number;
}> {
  const {
    openPositionId,
    tier1Contains,
    tier2Contains,
    tier3Contains,
    hasTier1,
    hasTier2,
    hasTier3,
    limit,
    offset,
  } = query;

  // Build where clause
  const where: Prisma.TagAnalisysWhereInput = {};

  if (openPositionId) {
    where.openPositionId = openPositionId;
  }

  if (hasTier1 !== undefined) {
    where.tier1 = hasTier1 ? { not: null } : null;
  }

  if (hasTier2 !== undefined) {
    where.tier2 = hasTier2 ? { not: null } : null;
  }

  if (hasTier3 !== undefined) {
    where.tier3 = hasTier3 ? { not: null } : null;
  }

  // Search for tags in tiers (using contains for JSON string search)
  if (tier1Contains) {
    where.tier1 = {
      contains: tier1Contains,
      mode: "insensitive",
    };
  }

  if (tier2Contains) {
    where.tier2 = {
      contains: tier2Contains,
      mode: "insensitive",
    };
  }

  if (tier3Contains) {
    where.tier3 = {
      contains: tier3Contains,
      mode: "insensitive",
    };
  }

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    prisma.tagAnalisys.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tagAnalisys.count({ where }),
  ]);

  return {
    data: data.map((item: {
      id: string;
      openPositionId: string;
      tier1: string | null;
      tier2: string | null;
      tier3: string | null;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: item.id,
      openPositionId: item.openPositionId,
      tier1: stringToTagsArray(item.tier1),
      tier2: stringToTagsArray(item.tier2),
      tier3: stringToTagsArray(item.tier3),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    total,
    limit,
    offset,
  };
}

/**
 * Update a tag analysis by ID
 * @param id - UUID of the tag analysis
 * @param data - Update data (validated with updateTagAnalisysSchema)
 * @returns Updated TagAnalisys if found, null otherwise
 * @throws Prisma error if update fails
 */
export async function updateTagAnalisys(
  id: string,
  data: UpdateTagAnalisysInput
): Promise<TagAnalisys | null> {
  // Check if exists
  const existing = await prisma.tagAnalisys.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  const result = await prisma.tagAnalisys.update({
    where: { id },
    data: {
      ...(data.tier1 !== undefined && { tier1: tagsArrayToString(data.tier1) }),
      ...(data.tier2 !== undefined && { tier2: tagsArrayToString(data.tier2) }),
      ...(data.tier3 !== undefined && { tier3: tagsArrayToString(data.tier3) }),
    },
  });

  return {
    id: result.id,
    openPositionId: result.openPositionId,
    tier1: stringToTagsArray(result.tier1),
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Update tag analysis by open position ID
 * @param openPositionId - UUID of the open position
 * @param data - Update data (validated with updateTagAnalisysSchema)
 * @returns Updated TagAnalisys if found, null otherwise
 * @throws Prisma error if update fails
 */
export async function updateTagAnalisysByOpenPositionId(
  openPositionId: string,
  data: UpdateTagAnalisysInput
): Promise<TagAnalisys | null> {
  // Check if exists
  const existing = await prisma.tagAnalisys.findUnique({
    where: { openPositionId },
  });

  if (!existing) {
    return null;
  }

  const result = await prisma.tagAnalisys.update({
    where: { openPositionId },
    data: {
      ...(data.tier1 !== undefined && { tier1: tagsArrayToString(data.tier1) }),
      ...(data.tier2 !== undefined && { tier2: tagsArrayToString(data.tier2) }),
      ...(data.tier3 !== undefined && { tier3: tagsArrayToString(data.tier3) }),
    },
  });

  return {
    id: result.id,
    openPositionId: result.openPositionId,
    tier1: stringToTagsArray(result.tier1),
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Delete a tag analysis by ID (hard delete - permanently removes from database)
 * @param id - UUID of the tag analysis
 * @returns Deleted TagAnalisys if found, null otherwise
 * @throws Prisma error if deletion fails
 */
export async function deleteTagAnalisys(
  id: string
): Promise<TagAnalisys | null> {
  // Check if exists
  const existing = await prisma.tagAnalisys.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  const result = await prisma.tagAnalisys.delete({
    where: { id },
  });

  return {
    id: result.id,
    openPositionId: result.openPositionId,
    tier1: stringToTagsArray(result.tier1),
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Delete tag analysis by open position ID
 * @param openPositionId - UUID of the open position
 * @returns Deleted TagAnalisys if found, null otherwise
 * @throws Prisma error if deletion fails
 */
export async function deleteTagAnalisysByOpenPositionId(
  openPositionId: string
): Promise<TagAnalisys | null> {
  // Check if exists
  const existing = await prisma.tagAnalisys.findUnique({
    where: { openPositionId },
  });

  if (!existing) {
    return null;
  }

  const result = await prisma.tagAnalisys.delete({
    where: { openPositionId },
  });

  return {
    id: result.id,
    openPositionId: result.openPositionId,
    tier1: stringToTagsArray(result.tier1),
    tier2: stringToTagsArray(result.tier2),
    tier3: stringToTagsArray(result.tier3),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}
