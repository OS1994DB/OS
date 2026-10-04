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
      const manager = await prisma.user.findUniqueOrThrow({ where: { email } });
      const resident = await prisma.resident.create({
        data: {
          name: "Sample Resident",
          dateOfBirth: new Date("1940-01-01"),
          roomNumber: "12",
          keyContactName: "Jane Sample",
          keyContactPhone: "07700 900000",
        },
      });
      const by = manager.id;
      await prisma.carePlanVersion.create({
        data: {
          residentId: resident.id, category: "MOBILITY", version: 1, createdById: by,
          identifiedRisk: "At risk of falls when transferring from bed to chair.",
          residentPerspective: "Wants to stay as independent as possible.",
          careSupport: "One carer to support transfers; walking frame within reach.",
          careDirective: "Always use the walking frame. Encourage, don't rush.",
        },
      });
      await prisma.note.create({
        data: { residentId: resident.id, authorId: by, category: "GENERAL", body: "Enjoyed lunch in the lounge and joined the afternoon quiz." },
      });
      const med = await prisma.medication.create({
        data: { residentId: resident.id, name: "Paracetamol", dose: "500mg", route: "ORAL", frequency: "Up to 4 times daily", instructions: "Max 8 tablets in 24h", prn: true, createdById: by },
      });
      await prisma.medicationAdministration.create({
        data: { medicationId: med.id, residentId: resident.id, outcome: "GIVEN", givenById: by },
      });
      await prisma.incident.create({
        data: { residentId: resident.id, type: "NEAR_MISS", severity: "LOW", occurredAt: new Date(Date.now() - 3600_000), location: "Lounge", description: "Slipped on a wet floor, caught by carer. No injury.", actionTaken: "Wet floor sign placed; maintenance informed.", reportedById: by },
      });
      console.log("Created a sample resident with care plan, note, medication and incident (SEED_SAMPLE_DATA=true).");
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
