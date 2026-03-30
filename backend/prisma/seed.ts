import "dotenv/config";

import bcrypt from "bcryptjs";

import { disconnectPrisma, prisma } from "./client.js";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`[seed] admin ${adminEmail} already exists`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`[seed] created admin ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error("[seed] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
