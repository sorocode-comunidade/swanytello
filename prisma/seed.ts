import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@swanytello.local" },
    update: {},
    create: {
      username: "admin",
      email: "admin@swanytello.local",
      password: hashed,
      name: "Admin",
      role: "ADMIN",
      active: true,
    },
  });
  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
