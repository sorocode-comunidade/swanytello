# Transform

This folder holds **data transformation functions** that clean, format, normalize, and prepare extracted data for storage. This is the **Transform** phase of ETL operations.

## Purpose

- **Cleaning**: Remove noise, sanitize HTML, remove duplicates, handle malformed data.
- **Formatting**: Convert data to consistent formats (e.g. markdown conversion, text extraction, date standardization).
- **Normalization**: Standardize data structures, field names, and values across different sources.
- **Validation**: Ensure data quality and structure before storage.
- **Preparation**: Structure data for optimal storage and retrieval by the RAG pipeline.

## Conventions

- Use `src/log` for logging transformation operations and errors.
- Keep transformation functions pure and reusable when possible.
- Output format should be compatible with how RAG ingests data (e.g. text chunks, metadata).
- Transformation functions should be idempotent when possible (same input produces same output).
- Use TypeScript types from `types.ts` for transformed data structures.

## Suggested structure

Add when implementing:

- **cleaners/** – Data cleaning modules (e.g. HTML sanitization, deduplication, noise removal).
- **formatters/** – Data formatting modules (e.g. markdown conversion, text extraction, date formatting).
- **normalizers/** – Data normalization (e.g. field name standardization, value normalization, schema alignment).
- **validators/** – Data validation functions (e.g. Zod schemas, structure checks, quality validation).
- **types.ts** – Shared types for transformed data structures.
- **utils/** – Shared transformation utilities and helpers.

## Usage

Transformation functions receive raw extracted data from `extract/` and return structured, cleaned data ready for storage in `load/`.
