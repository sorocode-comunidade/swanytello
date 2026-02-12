# ETL Process

This folder holds **ETL orchestration and scheduling**: running the full pipeline (extract → transform → load) and triggering it on a schedule.

## Purpose

- **Orchestrate** the three ETL phases in order for a given pipeline (e.g. LinkedIn jobs → open_position).
- **Schedule** runs so data is refreshed automatically: once on **startup** (after the server is listening) and then **every 12 hours**.

## Implemented

- **etl.process.ts**
  - **`runLinkedInEtlProcess()`** – Runs extract (`findLinkedInJobs`) → transform (`transformLinkedInJobsToOpenPositions`) → load (`loadOpenPositions`). Returns `{ extracted, transformed, created, skipped, error? }`. Only one run at a time (guard).
  - **`startEtlScheduler()`** – Runs the process once immediately (non-blocking), then every 12 hours via `setInterval`. Called from `server.ts` after `listen`.

## Usage

The scheduler is started automatically when the application starts; no manual call is required. To change the interval, edit `ETL_INTERVAL_MS` in `etl.process.ts` (default: 12 hours).

## See also

- [ETL README](../README.md) – Full ETL structure and LinkedIn pipeline.
- [Project structure (docs)](../../../docs/project_structure/project-structure.md) – ETL and startup sequence diagrams.
