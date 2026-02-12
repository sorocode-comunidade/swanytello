/**
 * Transforms LinkedIn job extract output into open_position-ready records.
 * Receives the result from the extract (findLinkedInJobs) and returns
 * validated CreateOpenPositionInput[] for the load phase to persist.
 */

import type { LinkedInJob } from "../extract/linkedin.scrapper.js";
import {
  createOpenPositionSchema,
  type CreateOpenPositionInput,
} from "../../db_operations/db_types/open_position.schema.js";

const TITLE_MAX = 500;
const COMPANY_NAME_MAX = 200;
const REGION_MAX = 200;
const DEFAULT_REGION = "Não informada";

function trimAndTruncate(value: string, max: number): string {
  return value.trim().slice(0, max);
}

/**
 * Transforms raw LinkedIn jobs from the scraper into records ready for the
 * open_position table. Validates each record against CreateOpenPositionInput;
 * invalid entries are skipped (e.g. invalid URL, empty required fields).
 *
 * @param extracted – Result from findLinkedInJobs() (extract phase)
 * @returns Array of validated create inputs for open_position (for the load phase)
 */
export function transformLinkedInJobsToOpenPositions(
  extracted: LinkedInJob[]
): CreateOpenPositionInput[] {
  const result: CreateOpenPositionInput[] = [];

  for (const job of extracted) {
    const title = trimAndTruncate(job.title, TITLE_MAX);
    const companyName = trimAndTruncate(job.company, COMPANY_NAME_MAX);
    const link = job.link.trim();
    const region = job.location
      ? trimAndTruncate(job.location, REGION_MAX)
      : DEFAULT_REGION;

    if (!title || !companyName || !link) continue;

    const parsed = createOpenPositionSchema.safeParse({
      title,
      link,
      companyName,
      region: region || DEFAULT_REGION,
    });

    if (parsed.success) {
      result.push(parsed.data);
    }
  }

  return result;
}
