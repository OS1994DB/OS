// Staff sign in with a username: 3-30 chars, lowercase letters, digits, dot, underscore, hyphen.
export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export function normalizeUsername(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}
