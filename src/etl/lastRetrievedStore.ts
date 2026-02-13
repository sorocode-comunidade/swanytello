/**
 * In-memory store for the last ETL run's retrieved open positions.
 * Updated by the ETL process after each run; read by the API for GET /api/open-positions/last-retrieved.
 */

import type { CreateOpenPositionInput } from "../db_operations/db_types/open_position.schema.js";

export interface LastRetrievedSnapshot {
  retrievedAt: string;
  extracted: number;
  transformed: number;
  created: number;
  skipped: number;
  positions: CreateOpenPositionInput[];
}

let lastSnapshot: LastRetrievedSnapshot | null = null;

/**
 * Updates the store with the last run's data. Called by the ETL process.
 */
export function setLastRetrieved(snapshot: LastRetrievedSnapshot): void {
  lastSnapshot = snapshot;
}

/**
 * Returns the last retrieved open positions and run metadata, or null if no run has completed yet.
 */
export function getLastRetrieved(): LastRetrievedSnapshot | null {
  return lastSnapshot;
}
