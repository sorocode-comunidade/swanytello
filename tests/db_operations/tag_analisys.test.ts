import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  createTagAnalisys,
  getTagAnalisysById,
  getTagAnalisysByOpenPositionId,
  getAllTagAnalisys,
  updateTagAnalisys,
  updateTagAnalisysByOpenPositionId,
  deleteTagAnalisys,
  deleteTagAnalisysByOpenPositionId,
} from "../../src/db_operations/models/tag_analisys.model.js";
import { createTagAnalisysSchema } from "../../src/db_operations/db_types/tag_analisys.schema.js";
import {
  cleanDatabase,
  createTestOpenPosition,
  createTestTagAnalisys,
  disconnectDatabase,
} from "../helpers/testDb.js";

describe("TagAnalisys Model", () => {
  let testOpenPositionId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const testPosition = await createTestOpenPosition();
    testOpenPositionId = testPosition.id;
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("createTagAnalisys", () => {
    it("should create a new tag analysis with tier arrays", async () => {
      const data = createTagAnalisysSchema.parse({
        openPositionId: testOpenPositionId,
        tier1: ["JavaScript", "TypeScript", "Node.js"],
        tier2: ["React", "Vue.js"],
        tier3: ["PostgreSQL", "MongoDB"],
      });

      const result = await createTagAnalisys(data);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.openPositionId).toBe(testOpenPositionId);
      expect(result.tier1).toEqual(["JavaScript", "TypeScript", "Node.js"]);
      expect(result.tier2).toEqual(["React", "Vue.js"]);
      expect(result.tier3).toEqual(["PostgreSQL", "MongoDB"]);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should create tag analysis with optional tiers", async () => {
      const data = createTagAnalisysSchema.parse({
        openPositionId: testOpenPositionId,
        tier1: ["JavaScript"],
        // tier2 and tier3 are optional
      });

      const result = await createTagAnalisys(data);

      expect(result.tier1).toEqual(["JavaScript"]);
      expect(result.tier2).toBeNull();
      expect(result.tier3).toBeNull();
    });

    it("should validate tier arrays", async () => {
      const invalidData = {
        openPositionId: testOpenPositionId,
        tier1: [""], // Empty string should fail
      };

      expect(() => createTagAnalisysSchema.parse(invalidData)).toThrow();
    });
  });

  describe("getTagAnalisysById", () => {
    it("should return tag analysis by ID", async () => {
      const testTag = await createTestTagAnalisys(testOpenPositionId);
      const result = await getTagAnalisysById(testTag.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testTag.id);
      expect(result?.openPositionId).toBe(testOpenPositionId);
      expect(Array.isArray(result?.tier1)).toBe(true);
    });

    it("should return null for non-existent ID", async () => {
      const result = await getTagAnalisysById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("getTagAnalisysByOpenPositionId", () => {
    it("should return tag analysis by open position ID", async () => {
      await createTestTagAnalisys(testOpenPositionId);
      const result = await getTagAnalisysByOpenPositionId(testOpenPositionId);

      expect(result).toBeDefined();
      expect(result?.openPositionId).toBe(testOpenPositionId);
    });

    it("should return null for non-existent open position ID", async () => {
      const result = await getTagAnalisysByOpenPositionId("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("getAllTagAnalisys", () => {
    it("should return all tag analyses", async () => {
      const position1 = await createTestOpenPosition();
      const position2 = await createTestOpenPosition();
      await createTestTagAnalisys(position1.id);
      await createTestTagAnalisys(position2.id);

      const result = await getAllTagAnalisys({
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should filter by open position ID", async () => {
      const position1 = await createTestOpenPosition();
      const position2 = await createTestOpenPosition();
      await createTestTagAnalisys(position1.id);
      await createTestTagAnalisys(position2.id);

      const result = await getAllTagAnalisys({
        openPositionId: position1.id,
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.openPositionId).toBe(position1.id);
    });

    it("should filter by tier presence", async () => {
      await createTestTagAnalisys(testOpenPositionId, {
        tier1: ["JavaScript"],
        tier2: ["React"],
        tier3: undefined,
      });

      const position2 = await createTestOpenPosition();
      await createTestTagAnalisys(position2.id, {
        tier1: undefined,
        tier2: undefined,
        tier3: undefined,
      });

      const result = await getAllTagAnalisys({
        hasTier1: true,
        limit: 10,
        offset: 0,
      });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((tag) => {
        expect(tag.tier1).not.toBeNull();
      });
    });
  });

  describe("updateTagAnalisys", () => {
    it("should update tag analysis by ID", async () => {
      const testTag = await createTestTagAnalisys(testOpenPositionId);
      const updateData = {
        tier1: ["Updated", "Tags"],
        tier2: ["New", "Tier2"],
      };

      const result = await updateTagAnalisys(testTag.id, updateData);

      expect(result?.tier1).toEqual(["Updated", "Tags"]);
      expect(result?.tier2).toEqual(["New", "Tier2"]);
    });

    it("should return null for non-existent ID", async () => {
      const result = await updateTagAnalisys("non-existent-id", {
        tier1: ["Updated"],
      });

      expect(result).toBeNull();
    });
  });

  describe("updateTagAnalisysByOpenPositionId", () => {
    it("should update tag analysis by open position ID", async () => {
      await createTestTagAnalisys(testOpenPositionId);
      const updateData = {
        tier1: ["Updated", "Tags"],
      };

      const result = await updateTagAnalisysByOpenPositionId(
        testOpenPositionId,
        updateData
      );

      expect(result?.tier1).toEqual(["Updated", "Tags"]);
    });

    it("should return null for non-existent open position ID", async () => {
      const result = await updateTagAnalisysByOpenPositionId(
        "non-existent-id",
        { tier1: ["Updated"] }
      );

      expect(result).toBeNull();
    });
  });

  describe("deleteTagAnalisys", () => {
    it("should delete tag analysis by ID", async () => {
      const testTag = await createTestTagAnalisys(testOpenPositionId);
      const result = await deleteTagAnalisys(testTag.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testTag.id);

      // Verify it's deleted
      const deleted = await getTagAnalisysById(testTag.id);
      expect(deleted).toBeNull();
    });

    it("should return null for non-existent ID", async () => {
      const result = await deleteTagAnalisys("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("deleteTagAnalisysByOpenPositionId", () => {
    it("should delete tag analysis by open position ID", async () => {
      await createTestTagAnalisys(testOpenPositionId);
      const result = await deleteTagAnalisysByOpenPositionId(testOpenPositionId);

      expect(result).toBeDefined();
      expect(result?.openPositionId).toBe(testOpenPositionId);

      // Verify it's deleted
      const deleted = await getTagAnalisysByOpenPositionId(testOpenPositionId);
      expect(deleted).toBeNull();
    });

    it("should return null for non-existent open position ID", async () => {
      const result = await deleteTagAnalisysByOpenPositionId("non-existent-id");
      expect(result).toBeNull();
    });
  });
});
