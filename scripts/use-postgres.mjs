// Switch the Prisma datasource from SQLite (local dev) to PostgreSQL.
// Usage: DATABASE_URL="postgresql://..." npm run db:use-postgres
// The checked-in migrations are SQLite SQL, so on a fresh Postgres database
// this script uses `prisma db push` to create the schema from schema.prisma.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) {
  console.error('Set DATABASE_URL to a postgresql:// connection string first.');
  process.exit(1);
}
const p = "prisma/schema.prisma";
const s = readFileSync(p, "utf8").replace(/provider = "sqlite"/, 'provider = "postgresql"');
writeFileSync(p, s);
execSync("npx prisma generate && npx prisma db push", { stdio: "inherit" });
console.log("Done. Commit the schema change, then run `npm run seed` to create the first manager.");
