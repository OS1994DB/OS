import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_MANAGER_EMAIL ?? "manager@example.com";
  const password = process.env.SEED_MANAGER_PASSWORD ?? crypto.randomBytes(9).toString("base64url");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Manager account already exists: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, name: "Manager", role: "MANAGER", passwordHash },
    });
    console.log("Created manager account:");
    console.log(`  email:    ${email}`);
    console.log(`  password: ${password}`);
    console.log("Sign in and change this password's owner via the Staff page as needed.");
  }

  if (process.env.SEED_SAMPLE_DATA === "true") {
    const count = await prisma.resident.count();
    if (count === 0) {
      await prisma.resident.create({
        data: {
          name: "Sample Resident",
          dateOfBirth: new Date("1940-01-01"),
          roomNumber: "12",
          keyContactName: "Jane Sample",
          keyContactPhone: "07700 900000",
        },
      });
      console.log("Created one sample resident (SEED_SAMPLE_DATA=true).");
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
