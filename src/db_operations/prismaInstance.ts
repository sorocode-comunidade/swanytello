import { PrismaClient } from "../../generated/prisma/index.js";

let prismaInstance: PrismaClient | Record<string, unknown>;
try {
  prismaInstance = new PrismaClient({
    log: ["query", "error", "warn"],
  });
} catch {
  prismaInstance = {};
}

export default prismaInstance;
