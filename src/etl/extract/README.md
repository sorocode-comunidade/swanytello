# Extract

This folder holds **data extraction operations** that fetch online data as part of the ETL pipeline. This is the **Extract** phase of ETL operations. Extracted content is then processed (Transform) and stored (Load) by other modules in `src/etl/`.

## Purpose

- Fetch data from websites or APIs for use as RAG knowledge sources.
- Extract raw data from various sources (web scraping, API calls, file reading, etc.).
- Run on a schedule or on demand; extracted data flows to the Transform phase.

## Conventions

- One subfolder or module per **source** or **extractor type** (e.g. by domain or by format).
- Use `src/log` for logging extraction operations; respect `robots.txt` and rate limits when scraping.
- Output format should be raw extracted data that will be processed by the Transform phase.
- Extractors should focus on data retrieval only; no transformation or storage logic here.

## Suggested structure

Add when implementing:

- **sources/** or per-source folders – One extractor per site or data source (e.g. `linkedin/`, `github/`, `api/`).
- **config.ts** – URLs, rate limits, selectors, env vars.
- **types.ts** – Shared types for extracted content (title, url, body, date, etc.).
- **utils/** – HTTP client, parsing helpers, retry logic.

The extracted data flows to `transform/` for processing; extractors do not call the API or channels directly.
