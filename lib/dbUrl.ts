// Find a Postgres connection string in the environment. Marketplace databases
// (e.g. Neon on Vercel) name their variables after a user-chosen prefix, e.g.
// STORAGE_URL / STORAGE_URL_UNPOOLED, so we match on value rather than name.
// `direct: true` prefers the non-pooled URL (needed for schema changes).
export function findPostgresUrl(env: Record<string, string | undefined>, direct = false): string | null {
  const isPg = (v?: string): v is string => !!v && /^postgres(ql)?:\/\//.test(v);
  const entries = Object.entries(env).filter(([, v]) => isPg(v)) as [string, string][];
  if (entries.length === 0) return null;
  const unpooled = (k: string) => /UNPOOLED|NON_POOLING|DIRECT/i.test(k);
  const rank = (k: string) => (/PRISMA_URL$/.test(k) ? 0 : /DATABASE_URL$/.test(k) ? 1 : /URL$/.test(k) ? 2 : 3);
  const pooledList = entries.filter(([k]) => !unpooled(k)).sort((a, b) => rank(a[0]) - rank(b[0]));
  const directList = entries.filter(([k]) => unpooled(k)).sort((a, b) => rank(a[0]) - rank(b[0]));
  const list = direct ? [...directList, ...pooledList] : [...pooledList, ...directList];
  return direct ? list[0][1] : withPgbouncer(list[0][1]);
}

// Poolers in transaction mode (Neon "-pooler" hosts, pgbouncer) break Prisma's
// prepared statements under concurrent queries unless told about pgbouncer.
export function withPgbouncer(url: string): string {
  if (!/-pooler\.|pgbouncer/i.test(url) || /[?&]pgbouncer=/i.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + "pgbouncer=true&connect_timeout=15";
}
