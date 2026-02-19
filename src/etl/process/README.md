# ETL Process

This folder holds **ETL orchestration and scheduling**: running the full pipeline (extract → transform → load) and triggering it on a schedule.

## Purpose

- **Orchestrate** the three ETL phases in order for a given pipeline (e.g. LinkedIn jobs → open_position).
- **Schedule** runs so data is refreshed automatically: once on **startup** (after the server is listening) and then **every 6 hours** (via the app scheduler in `src/scheduler.ts`).

## Implemented

- **etl.process.ts**
  - **`runLinkedInEtlProcess()`** – Runs extract (`findLinkedInJobs`) → transform (`transformLinkedInJobsToOpenPositions`) → load (`loadOpenPositions`). Returns `{ extracted, transformed, created, skipped, error? }`. Only one run at a time (guard).
  - **`runEtlOnce()`** – Runs the process once (non-blocking). Used by the app scheduler.
  - **`ETL_INTERVAL_MS`** – Interval constant (6 hours). The actual 6h schedule is in `src/scheduler.ts`, which runs ETL then sends new open positions to WhatsApp.

## Usage

The app scheduler (`startScheduledJobs()` in `src/scheduler.ts`) is started from `server.ts` after listen. It runs ETL then WhatsApp send every 6 hours. To change the interval, edit `ETL_INTERVAL_MS` in `etl.process.ts` and use it in `scheduler.ts`.

## See also

- [ETL README](../README.md) – Full ETL structure and LinkedIn pipeline.
- [Project structure (docs)](../../../docs/project_structure/project-structure.md) – ETL and startup sequence diagrams.
