import { PrismaClient } from "../../../generated/prisma/index.js";

const prismaInstance = new PrismaClient({
  log: ["query", "error", "warn"],
});

export default prismaInstance;
