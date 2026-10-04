// Vercel build entry point.
// - DATABASE_URL is postgres:// -> persistent mode: switch the Prisma provider,
//   create/update tables with `db push`, seed idempotently, build.
// - otherwise -> throwaway demo mode: seed a SQLite file bundled into the build
//   (data resets and is NOT shared between server instances).
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });
const url = process.env.DATABASE_URL ?? "";

if (/^postgres(ql)?:\/\//.test(url)) {
  const p = "prisma/schema.prisma";
  writeFileSync(p, readFileSync(p, "utf8").replace(/provider = "sqlite"/, 'provider = "postgresql"'));
  run("npx prisma generate");
  run("npx prisma db push --skip-generate");
  run("npx tsx scripts/seed.ts");
  run("npx next build", { DEMO_DB_COPY: "false" });
} else {
  run("npx prisma generate");
  run("npx prisma migrate deploy");
  run("npx tsx scripts/seed.ts");
  run("npx next build");
}
