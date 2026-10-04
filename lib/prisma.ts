import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { findPostgresUrl } from "@/lib/dbUrl";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Demo hosting (e.g. Vercel, where the filesystem is read-only/ephemeral):
// copy the bundled, build-time-seeded SQLite file to /tmp and use that.
// Changes made on the demo are NOT durable. Never use this for real data.
function createClient() {
  const pg = findPostgresUrl(process.env);
  if (pg) return new PrismaClient({ datasources: { db: { url: pg } } });
  if (process.env.DEMO_DB_COPY !== "true") return new PrismaClient();
  const target = "/tmp/care-demo.db";
  if (!fs.existsSync(target)) {
    fs.copyFileSync(path.join(process.cwd(), "prisma", "demo.db"), target);
  }
  return new PrismaClient({ datasources: { db: { url: `file:${target}` } } });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
