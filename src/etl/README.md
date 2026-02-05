# ETL (Extract, Transform, Load)

This folder holds **ETL operations** that fetch, process, and store data for the RAG pipeline in `src/rag`. This includes web scraping, data formatting, cleaning, and database storage.

## Purpose

- **Extract**: Fetch data from websites or APIs for use as RAG knowledge sources.
- **Transform**: Normalize, format, and clean scraped content (e.g. sanitization, deduplication, structuring).
- **Load**: Persist processed content to the database (e.g. for embedding, indexing, or direct querying).
- Run on a schedule or on demand; **RAG** consumes this data when answering user questions.

## Structure

- **`extract/`** – Data extraction operations (web scrapers, API calls, file reading). One subfolder or module per source or extractor type (e.g. by domain or by format).
- **`transform/`** – Data transformation and cleaning logic (formatting, sanitization, normalization, preparation for storage).
- **`load/`** – Data publishing operations (database storage, API delivery, file output, indexing).

## Conventions

- Use `src/log` for logging ETL runs and errors.
- Respect `robots.txt` and rate limits when scraping.
- Output format should be compatible with how RAG ingests data (e.g. text chunks, metadata).
- Keep extractors organized by source in `extract/` subfolder.
- Transformation and loading logic should be modular and reusable.

## Suggested structure

Add when implementing:

### Extract (`extract/`)
- **sources/** or per-source folders – One extractor per site or data source (e.g. `linkedin/`, `github/`, `api/`).
- **config.ts** – URLs, rate limits, selectors, env vars.
- **types.ts** – Shared types for extracted content (title, url, body, date, etc.).
- **utils/** – HTTP client, parsing helpers, retry logic.

### Transform (`transform/`)
- **cleaners/** – Data cleaning modules (e.g. HTML sanitization, deduplication, noise removal).
- **formatters/** – Data formatting modules (e.g. markdown conversion, text extraction, date formatting).
- **normalizers/** – Data normalization (e.g. field name standardization, value normalization, schema alignment).
- **validators/** – Data validation functions (e.g. Zod schemas, structure checks, quality validation).
- **types.ts** – Shared types for transformed data structures.
- **utils/** – Shared transformation utilities and helpers.

### Load (`load/`)
- **persisters/** – Database persistence modules (Prisma model operations).
- **publishers/** – API delivery and event publishing modules.
- **writers/** – File output modules (JSON, CSV, etc.).
- **indexers/** – Search index and vector database update modules.
- **validators/** – Final data validation before loading (Zod schemas, structure checks).
- **types.ts** – Shared types for load operations and output formats.
- **utils/** – Shared loading utilities and helpers (retry logic, batching, etc.).

**RAG** in `src/rag` will consume this data; ETL operations do not call the API or channels directly.
