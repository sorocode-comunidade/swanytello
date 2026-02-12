/**
 * Load phase: persist transformed open position data to the database.
 * Skips records that already exist (same link) to avoid duplicates on repeated ETL runs.
 */

import type { CreateOpenPositionInput } from "../../db_operations/db_types/open_position.schema.js";
import {
  createOpenPosition,
  getOpenPositionByLink,
} from "../../db_operations/models/open_position.model.js";

export interface LoadOpenPositionsResult {
  created: number;
  skipped: number;
}

/**
 * Inserts open position records into the database. For each record, if a row
 * with the same link already exists, it is skipped; otherwise it is created.
 * Suitable for periodic ETL (e.g. every 12h) without duplicating jobs.
 *
 * @param data – Transformed create inputs from the transform phase
 * @returns Counts of created and skipped records
 */
export async function loadOpenPositions(
  data: CreateOpenPositionInput[]
): Promise<LoadOpenPositionsResult> {
  let created = 0;
  let skipped = 0;

  for (const item of data) {
    const existing = await getOpenPositionByLink(item.link);
    if (existing) {
      skipped++;
      continue;
    }
    await createOpenPosition(item);
    created++;
  }

  return { created, skipped };
}
