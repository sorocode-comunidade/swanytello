import { z } from "zod";

/**
 * Zod schemas for TagAnalisys model validation
 * Used for input validation (create, update) and return type inference
 * 
 * Tiers are stored as arrays of tag words. Each tier can contain multiple tags.
 */

// Helper schema for tag arrays - array of non-empty strings
const tagArraySchema = z.array(z.string().min(1).max(100)).min(1).max(50);

// Create schema - requires openPositionId, tiers are optional arrays
export const createTagAnalisysSchema = z.object({
  openPositionId: z.string().uuid(),
  tier1: tagArraySchema.optional(),
  tier2: tagArraySchema.optional(),
  tier3: tagArraySchema.optional(),
});

// Update schema - all fields optional
export const updateTagAnalisysSchema = z.object({
  tier1: tagArraySchema.optional(),
  tier2: tagArraySchema.optional(),
  tier3: tagArraySchema.optional(),
});

// Query/Filter schema for listing tag analyses
export const queryTagAnalisysSchema = z.object({
  openPositionId: z.string().uuid().optional(),
  tier1Contains: z.string().optional(), // Search for tag in tier1
  tier2Contains: z.string().optional(), // Search for tag in tier2
  tier3Contains: z.string().optional(), // Search for tag in tier3
  hasTier1: z.boolean().optional(), // Filter by presence of tier1
  hasTier2: z.boolean().optional(), // Filter by presence of tier2
  hasTier3: z.boolean().optional(), // Filter by presence of tier3
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

// Return schema - includes all fields including id and timestamps
// Tiers are returned as arrays (parsed from stored string format)
export const tagAnalisysSchema = z.object({
  id: z.string().uuid(),
  openPositionId: z.string().uuid(),
  tier1: z.array(z.string()).nullable(),
  tier2: z.array(z.string()).nullable(),
  tier3: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports inferred from schemas
export type CreateTagAnalisysInput = z.infer<typeof createTagAnalisysSchema>;
export type UpdateTagAnalisysInput = z.infer<typeof updateTagAnalisysSchema>;
export type QueryTagAnalisysInput = z.infer<typeof queryTagAnalisysSchema>;
export type TagAnalisys = z.infer<typeof tagAnalisysSchema>;

/**
 * Helper functions to convert between array format and database string format
 * Database stores tiers as JSON strings, but we work with arrays in code
 */

/**
 * Convert tag array to database string format (JSON)
 */
export function tagsArrayToString(tags: string[] | null | undefined): string | null {
  if (!tags || tags.length === 0) {
    return null;
  }
  return JSON.stringify(tags);
}

/**
 * Convert database string format (JSON) to tag array
 */
export function stringToTagsArray(str: string | null | undefined): string[] | null {
  if (!str) {
    return null;
  }
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    // If parsing fails, try comma-separated format as fallback
    return str.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  }
}
