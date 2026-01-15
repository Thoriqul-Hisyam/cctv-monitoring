import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("adminadmin123", 10);

  const superadmin = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: password,
      role: "superadmin", // pastikan field role ada di model user
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Superadmin created:", superadmin.username);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
