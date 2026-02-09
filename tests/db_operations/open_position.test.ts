import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  createOpenPosition,
  getOpenPositionById,
  getAllOpenPositions,
  updateOpenPosition,
  deleteOpenPosition,
  coldDeleteOpenPosition,
} from "../../src/db_operations/models/open_position.model.js";
import { createOpenPositionSchema } from "../../src/db_operations/db_types/open_position.schema.js";
import { cleanDatabase, createTestOpenPosition, disconnectDatabase } from "../helpers/testDb.js";
import { PrismaClient } from "../../generated/prisma/index.js";
import prismaInstance from "../../src/db_operations/prismaInstance.js";

describe("OpenPosition Model", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("createOpenPosition", () => {
    it("should create a new open position", async () => {
      const data = createOpenPositionSchema.parse({
        title: "Senior Software Engineer",
        link: "https://example.com/jobs/123",
        companyName: "Tech Corp",
        region: "Remote",
      });

      const result = await createOpenPosition(data);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(data.title);
      expect(result.link).toBe(data.link);
      expect(result.companyName).toBe(data.companyName);
      expect(result.region).toBe(data.region);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should validate input with Zod schema", async () => {
      const invalidData = {
        title: "", // Empty string should fail
        link: "not-a-url", // Invalid URL
        companyName: "Test",
        region: "Remote",
      };

      expect(() => createOpenPositionSchema.parse(invalidData)).toThrow();
    });
  });

  describe("getOpenPositionById", () => {
    it("should return an open position by ID", async () => {
      const testPosition = await createTestOpenPosition();
      const result = await getOpenPositionById(testPosition.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testPosition.id);
      expect(result?.title).toBe(testPosition.title);
    });

    it("should return null for non-existent ID", async () => {
      const result = await getOpenPositionById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("getAllOpenPositions", () => {
    it("should return all open positions", async () => {
      await createTestOpenPosition({ title: "Position 1", companyName: "Company A" });
      await createTestOpenPosition({ title: "Position 2", companyName: "Company B" });

      const result = await getAllOpenPositions({
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it("should filter by company name", async () => {
      await createTestOpenPosition({ companyName: "Company A" });
      await createTestOpenPosition({ companyName: "Company B" });

      const result = await getAllOpenPositions({
        companyName: "Company A",
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.companyName).toBe("Company A");
    });

    it("should filter by region", async () => {
      await createTestOpenPosition({ region: "Remote" });
      await createTestOpenPosition({ region: "On-site" });

      const result = await getAllOpenPositions({
        region: "Remote",
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.region).toBe("Remote");
    });

    it("should search in title and company name", async () => {
      await createTestOpenPosition({ title: "Senior Engineer", companyName: "Tech Corp" });
      await createTestOpenPosition({ title: "Junior Developer", companyName: "Other Corp" });

      const result = await getAllOpenPositions({
        search: "Senior",
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.title).toContain("Senior");
    });

    it("should paginate results", async () => {
      // Create 5 test positions
      for (let i = 0; i < 5; i++) {
        await createTestOpenPosition({ title: `Position ${i}` });
      }

      const result = await getAllOpenPositions({
        limit: 2,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(5);
    });
  });

  describe("updateOpenPosition", () => {
    it("should update an open position", async () => {
      const testPosition = await createTestOpenPosition();
      const updateData = {
        title: "Updated Title",
        region: "Updated Region",
      };

      const result = await updateOpenPosition(testPosition.id, updateData);

      expect(result).toBeDefined();
      expect(result?.title).toBe(updateData.title);
      expect(result?.region).toBe(updateData.region);
      expect(result?.companyName).toBe(testPosition.companyName); // Unchanged
    });

    it("should return null for non-existent ID", async () => {
      const result = await updateOpenPosition("non-existent-id", {
        title: "Updated",
      });

      expect(result).toBeNull();
    });

    it("should only update provided fields", async () => {
      const testPosition = await createTestOpenPosition();
      const originalTitle = testPosition.title;

      const result = await updateOpenPosition(testPosition.id, {
        region: "New Region",
      });

      expect(result?.region).toBe("New Region");
      expect(result?.title).toBe(originalTitle); // Unchanged
    });
  });

  describe("deleteOpenPosition", () => {
    it("should delete an open position", async () => {
      const testPosition = await createTestOpenPosition();
      const result = await deleteOpenPosition(testPosition.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testPosition.id);

      // Verify it's deleted
      const deleted = await getOpenPositionById(testPosition.id);
      expect(deleted).toBeNull();
    });

    it("should return null for non-existent ID", async () => {
      const result = await deleteOpenPosition("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("coldDeleteOpenPosition", () => {
    it("should move open position to cold_deleted table", async () => {
      const testPosition = await createTestOpenPosition();
      const result = await coldDeleteOpenPosition(testPosition.id);

      expect(result).toBeDefined();
      expect(result?.originalId).toBe(testPosition.id);
      expect(result?.title).toBe(testPosition.title);
      expect(result?.deletedAt).toBeInstanceOf(Date);

      // Verify it's removed from open_position
      const deleted = await getOpenPositionById(testPosition.id);
      expect(deleted).toBeNull();

      // Verify it's in cold_deleted
      const prisma = prismaInstance as PrismaClient;
      const coldDeleted = await prisma.coldDeleted.findUnique({
        where: { originalId: testPosition.id },
      });
      expect(coldDeleted).toBeDefined();
      expect(coldDeleted?.originalId).toBe(testPosition.id);
    });

    it("should return null for non-existent ID", async () => {
      const result = await coldDeleteOpenPosition("non-existent-id");
      expect(result).toBeNull();
    });

    it("should preserve original timestamps", async () => {
      const testPosition = await createTestOpenPosition();
      const originalCreatedAt = testPosition.createdAt;
      const originalUpdatedAt = testPosition.updatedAt;

      // Wait a bit to ensure timestamps are different
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await coldDeleteOpenPosition(testPosition.id);

      expect(result?.createdAt).toEqual(originalCreatedAt);
      expect(result?.updatedAt).toEqual(originalUpdatedAt);
      expect(result?.deletedAt).toBeInstanceOf(Date);
    });
  });
});
