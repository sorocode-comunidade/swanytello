import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/index.js";

let prismaInstance: PrismaClient | Record<string, unknown>;

if (process.env.DATABASE_URL) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  prismaInstance = new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });
} else {
  prismaInstance = {};
}

export default prismaInstance;
