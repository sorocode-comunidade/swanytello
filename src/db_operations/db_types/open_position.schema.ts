import { z } from "zod";

/**
 * Zod schemas for OpenPosition model validation
 * Used for input validation (create, update) and return type inference
 */

// Create schema - all required fields except id (auto-generated) and timestamps
export const createOpenPositionSchema = z.object({
  title: z.string().min(1).max(500),
  link: z.string().url(),
  companyName: z.string().min(1).max(200),
  region: z.string().min(1).max(200),
});

// Update schema - all fields optional
export const updateOpenPositionSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  link: z.string().url().optional(),
  companyName: z.string().min(1).max(200).optional(),
  region: z.string().min(1).max(200).optional(),
});

// Query/Filter schema for listing open positions
export const queryOpenPositionSchema = z.object({
  companyName: z.string().optional(),
  region: z.string().optional(),
  search: z.string().optional(), // Search in title or company name
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

// Return schema - includes all fields including id and timestamps
export const openPositionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  link: z.string().url(),
  companyName: z.string(),
  region: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Cold deleted schema - for soft delete operations
export const coldDeletedSchema = z.object({
  id: z.string().uuid(),
  originalId: z.string().uuid(),
  title: z.string(),
  link: z.string().url(),
  companyName: z.string(),
  region: z.string(),
  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports inferred from schemas
export type CreateOpenPositionInput = z.infer<typeof createOpenPositionSchema>;
export type UpdateOpenPositionInput = z.infer<typeof updateOpenPositionSchema>;
export type QueryOpenPositionInput = z.infer<typeof queryOpenPositionSchema>;
export type OpenPosition = z.infer<typeof openPositionSchema>;
export type ColdDeleted = z.infer<typeof coldDeletedSchema>;
