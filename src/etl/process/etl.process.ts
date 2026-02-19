/**
 * ETL process: runs extract → transform → load for LinkedIn open positions.
 * Intended to run on startup and every 6 hours. Only one run executes at a time.
 */

import { findLinkedInJobs } from "../extract/index.js";
import { transformLinkedInJobsToOpenPositions } from "../transform/index.js";
import { loadOpenPositions } from "../load/index.js";
import { setLastRetrieved } from "../lastRetrievedStore.js";

/** Interval for scheduled ETL runs (used by app scheduler, not by this module). */
export const ETL_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

let isRunning = false;

export interface EtlProcessResult {
  extracted: number;
  transformed: number;
  created: number;
  skipped: number;
  error?: string;
}

/**
 * Runs the full ETL pipeline: LinkedIn extract → transform → load to database.
 * Skips duplicates by link. Safe to call repeatedly; only one run at a time.
 */
export async function runLinkedInEtlProcess(): Promise<EtlProcessResult> {
  if (isRunning) {
    return {
      extracted: 0,
      transformed: 0,
      created: 0,
      skipped: 0,
      error: "ETL already in progress",
    };
  }

  isRunning = true;
  const result: EtlProcessResult = {
    extracted: 0,
    transformed: 0,
    created: 0,
    skipped: 0,
  };

  try {
    const extracted = await findLinkedInJobs();
    result.extracted = extracted.length;

    const transformed = transformLinkedInJobsToOpenPositions(extracted);
    result.transformed = transformed.length;

    const loadResult = await loadOpenPositions(transformed);
    result.created = loadResult.created;
    result.skipped = loadResult.skipped;

    setLastRetrieved({
      retrievedAt: new Date().toISOString(),
      extracted: result.extracted,
      transformed: result.transformed,
      created: result.created,
      skipped: result.skipped,
      positions: transformed,
    });

    return result;
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    return result;
  } finally {
    isRunning = false;
  }
}

/**
 * Runs the ETL process once (non-blocking). Used by the app scheduler for the 6h schedule.
 * For backwards compatibility; the 6h interval is handled by the app scheduler.
 */
export function runEtlOnce(): void {
  runLinkedInEtlProcess()
    .then((r) => {
      if (r.error) {
        console.warn("[ETL] Run failed:", r.error);
      } else {
        console.log(
          `[ETL] Done: extracted=${r.extracted} transformed=${r.transformed} created=${r.created} skipped=${r.skipped}`
        );
      }
    })
    .catch((err) => {
      console.warn("[ETL] Error:", err);
    });
}
