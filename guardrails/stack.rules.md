# Stack (guardrails)

Technologies and version expectations for the Swanytello project.

## Runtime and language

- **Node.js**: v20+ (Prisma 7 may require 20.19+, 22.12+, or 24+).
- **TypeScript**: 5.x. Strict mode enabled. Target ES2022; module ESNext.

## API

- **Fastify**: 5.x for the REST API.
- **@fastify/jwt**: JWT authentication.
- **Zod**: Validation schemas (e.g. 3.x). Validate in the service layer; use Zod errors in routes for 400 responses.

## Database

- **Prisma**: 6.x or 7.x. PostgreSQL. Schema in `prisma/schema.prisma`; client output can be custom (e.g. `generated/prisma`). Use Prisma config file (e.g. `prisma.config.ts`) when on Prisma 7 for datasource URL.
- **Database**: PostgreSQL 12+.

## Auth and security

- **bcrypt**: Password hashing (e.g. 6.x).
- **JWT**: Access token with configurable expiration (e.g. env `JWT_ACCESS_EXPIRATION`). Optional conditional auth bypass via env (e.g. `AUTH_STATUS=off`) for development only.

## Bot and RAG

- **LangChain**: For RAG logic in `src/rag`. Versions and integrations (embeddings, vector store) to be set when implementing.

## Channels

- **WhatsApp**: To be chosen (e.g. Business API client or Baileys). Document in `src/channels/whatsapp/README.md`.
- **Discord**: e.g. discord.js. Document in `src/channels/discord/README.md`.

## Tooling

- **tsx**: Run and watch TypeScript (e.g. `npm run start`, `npm run dev` via nodemon).
- **nodemon**: Watch `src` and `prisma`; exec `tsx src/server.ts`.
- **dotenv**: Load env (e.g. for Prisma config and app config).

## Module system

- **ESM** only. `"type": "module"` in `package.json`. Imports use `.js` extension where required for resolution.
