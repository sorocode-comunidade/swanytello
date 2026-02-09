import { PrismaClient } from "../../generated/prisma/index.js";
import prismaInstance from "../../src/db_operations/prismaInstance.js";

/**
 * Test Database Utilities
 * Helper functions for setting up and cleaning up test database
 */

const prisma = prismaInstance as PrismaClient;

/**
 * Clean all test data from database
 * Use this in beforeEach or afterEach to ensure clean state
 */
export async function cleanDatabase(): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.tagAnalisys.deleteMany();
  await prisma.coldDeleted.deleteMany();
  await prisma.openPosition.deleteMany();
}

/**
 * Create a test open position with sample data
 */
export async function createTestOpenPosition(data?: {
  title?: string;
  link?: string;
  companyName?: string;
  region?: string;
}) {
  return await prisma.openPosition.create({
    data: {
      title: data?.title || "Test Software Engineer",
      link: data?.link || "https://example.com/jobs/test",
      companyName: data?.companyName || "Test Company",
      region: data?.region || "Remote",
    },
  });
}

/**
 * Create a test tag analysis with sample data
 */
export async function createTestTagAnalisys(openPositionId: string, data?: {
  tier1?: string[] | null;
  tier2?: string[] | null;
  tier3?: string[] | null;
}) {
  return await prisma.tagAnalisys.create({
    data: {
      openPositionId,
      tier1: data?.tier1 !== undefined 
        ? (data.tier1 === null ? null : JSON.stringify(data.tier1))
        : JSON.stringify(["JavaScript", "TypeScript"]),
      tier2: data?.tier2 !== undefined
        ? (data.tier2 === null ? null : JSON.stringify(data.tier2))
        : JSON.stringify(["React"]),
      tier3: data?.tier3 !== undefined
        ? (data.tier3 === null ? null : JSON.stringify(data.tier3))
        : JSON.stringify(["PostgreSQL"]),
    },
  });
}

/**
 * Disconnect from database (call in afterAll)
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
