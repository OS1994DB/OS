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
  return list[0][1];
}
