import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "changeme";
  const name = process.env.ADMIN_NAME || "Admin";

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.log("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars, or defaults will be used.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin user already exists, updating role to ADMIN...");
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) },
    });
    console.log("Admin user updated.");
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await bcrypt.hash(password, 10),
        role: "ADMIN",
      },
    });
    console.log("Admin user created.");
  }

  console.log(`  Email: ${email}`);
  console.log(`  Role: ADMIN`);
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
