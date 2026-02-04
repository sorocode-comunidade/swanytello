# Swanytello

Projeto desenvolvido para a comunidade Sorocode, unindo os projetos SwanyBot e DonatelloBot.

---

## Navigation

- [Swanytello](#swanytello)
  - [Navigation](#navigation)
  - [Getting started](#getting-started)
  - [Scripts](#scripts)
  - [Project structure](#project-structure)
  - [Documentation](#documentation)

---

## Getting started

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and other variables.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations (when you have a database): `npx prisma migrate dev`
5. Start the API: `npm run dev`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the server with hot reload (nodemon + tsx) |
| `npm run start` | Start the server (tsx) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run type-check` | Run TypeScript type checking |

---

## Project structure

```
├── prisma/           # Schema, migrations
├── src/
│   ├── api/          # Fastify API (routes, controllers, services, models)
│   ├── bot/          # Bot implementations
│   ├── log/          # Logging utilities
│   ├── types/        # TypeScript types
│   ├── utils/        # Shared utilities
│   └── server.ts     # Entry point
├── prisma.config.ts
└── package.json
```

---

## Documentation

- **[Bot](src/bot/README.md)** – This folder holds bot implementations (e.g. SwanyBot, DonatelloBot).
- **[Logging](src/log/README.md)** – Logging utilities; how to use `logCreate`, `logUpdate`, `logDelete`, and `logError`.
