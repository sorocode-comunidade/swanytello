/**
 * LinkedIn job search scraper.
 * Fetches public job listings from LinkedIn search (no auth).
 * Output is raw extracted data for the Transform phase.
 */

import * as cheerio from "cheerio";

export const LINKEDIN_JOBS_URL =
  "https://www.linkedin.com/jobs/search?keywords=Desenvolvedor&location=Sorocaba%2C%20S%C3%A3o%20Paulo%2C%20Brasil&geoId=100218040&distance=25&f_TPR=r604800&position=1&pageNum=0";

export const LINKEDIN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
} as const;

export interface LinkedInJob {
  title: string;
  company: string;
  link: string;
  location?: string;
}

/**
 * Fetches LinkedIn job search page and parses job cards into a list of job objects.
 * Uses the same selectors as the reference Python scraper (base-card, base-search-card__title, etc.).
 *
 * @returns List of jobs (title, company, link, optional location). Empty on fetch or parse errors.
 */
export async function findLinkedInJobs(): Promise<LinkedInJob[]> {
  let response: Response;
  try {
    response = await fetch(LINKEDIN_JOBS_URL, {
      method: "GET",
      headers: LINKEDIN_HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[LinkedIn scraper] Error fetching URL: ${message}`);
    return [];
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const jobs: LinkedInJob[] = [];
  const jobListings = $("div.base-card");

  jobListings.each((_, el) => {
    const $el = $(el);
    const titleTag = $el.find("h3.base-search-card__title");
    const companyTag = $el.find("h4.base-search-card__subtitle");
    const linkTag = $el.find("a.base-card__full-link");
    const locationTag = $el.find("span.job-search-card__location");

    const title = titleTag.text().trim();
    const company = companyTag.text().trim();
    const href = linkTag.attr("href");
    if (!title || !company || !href) return;

    const link = href.split("?")[0];
    const job: LinkedInJob = { title, company, link };
    const location = locationTag.text().trim();
    if (location) job.location = location;
    jobs.push(job);
  });

  return jobs;
}
