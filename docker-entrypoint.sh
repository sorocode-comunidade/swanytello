#!/bin/sh
set -e

echo "Starting application initialization..."

echo "Running database migrations..."
npx prisma migrate deploy || echo "Warning: Migration failed. Continuing anyway..."

echo "Running database seed..."
npm run seed || echo "Warning: Seed script failed. Continuing anyway..."

echo "Starting Fastify server..."
exec tsx src/server.ts
