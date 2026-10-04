// Vercel build entry point.
// - A postgres:// URL is present (DATABASE_URL or a marketplace-prefixed
//   variable such as STORAGE_URL) -> persistent mode: switch the Prisma
//   provider, create/update tables with `db push`, seed idempotently, build.
// - otherwise -> throwaway demo mode: seed a SQLite file bundled into the build
//   (data resets and is NOT shared between server instances).
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const isPg = (v) => !!v && /^postgres(ql)?:\/\//.test(v);
const unpooled = (k) => /UNPOOLED|NON_POOLING|DIRECT/i.test(k);
function find(direct) {
  const e = Object.entries(process.env).filter(([, v]) => isPg(v));
  if (!e.length) return null;
  const rank = (k) => (/PRISMA_URL$/.test(k) ? 0 : /DATABASE_URL$/.test(k) ? 1 : /URL$/.test(k) ? 2 : 3);
  const pooledList = e.filter(([k]) => !unpooled(k)).sort((a, b) => rank(a[0]) - rank(b[0]));
  const directList = e.filter(([k]) => unpooled(k)).sort((a, b) => rank(a[0]) - rank(b[0]));
  const list = direct ? [...directList, ...pooledList] : [...pooledList, ...directList];
  return direct ? list[0][1] : withPgbouncer(list[0][1]);
}
function withPgbouncer(url) {
  if (!/-pooler\.|pgbouncer/i.test(url) || /[?&]pgbouncer=/i.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + "pgbouncer=true&connect_timeout=15";
}
const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

const pooled = find(false);
if (pooled) {
  const direct = find(true) ?? pooled;
  const p = "prisma/schema.prisma";
  writeFileSync(p, readFileSync(p, "utf8").replace(/provider = "sqlite"/, 'provider = "postgresql"'));
  console.log("Postgres detected: persistent mode");
  run("npx prisma generate", { DATABASE_URL: pooled });
  run("npx prisma db push --skip-generate", { DATABASE_URL: direct });
  run("npx tsx scripts/seed.ts", { DATABASE_URL: pooled });
  run("npx next build", { DATABASE_URL: pooled });
} else {
  console.log("No Postgres URL found: throwaway SQLite demo mode");
  run("npx prisma generate");
  run("npx prisma migrate deploy");
  run("npx tsx scripts/seed.ts");
  run("npx next build");
}
