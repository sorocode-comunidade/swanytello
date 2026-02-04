# Scrapers

This folder holds **web scrapers** that fetch online data for the RAG pipeline in `src/bot`. Scraped content can be stored, processed, and used as context for retrieval-augmented generation.

## Purpose

- Fetch data from websites or APIs for use as RAG knowledge sources.
- Normalize and optionally persist scraped content (e.g. for embedding or indexing).
- Run on a schedule or on demand; the **bot** (RAG) consumes this data when answering user questions.

## Conventions

- One subfolder or module per **source** or **scraper type** (e.g. by domain or by format).
- Use `src/log` for logging; respect `robots.txt` and rate limits when scraping.
- Output format should be compatible with how the bot/RAG ingests data (e.g. text chunks, metadata).

## Suggested structure

Add when implementing:

- **sources/** or per-source folders – One scraper per site or data source.
- **config.ts** – URLs, rate limits, selectors, env vars.
- **types.ts** – Shared types for scraped content (title, url, body, date, etc.).
- **utils/** – HTTP client, parsing, sanitization, optional persistence helpers.

The **bot** (RAG) in `src/bot` will consume this data; scrapers do not call the API or channels directly.
