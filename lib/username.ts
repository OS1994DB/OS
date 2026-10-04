// Staff sign in with a username: 3-30 chars, lowercase letters, digits, single
// spaces, dot, underscore, hyphen. Matching is case-insensitive and ignores
// extra whitespace ("Westcliff   Lodge" == "westcliff lodge").
export const USERNAME_RE = /^[a-z0-9][a-z0-9._ -]{1,28}[a-z0-9]$/;

export const USERNAME_HELP = "3–30 characters: letters, numbers, spaces, dots, dashes or underscores";

export function normalizeUsername(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().replace(/\s+/g, " ").toLowerCase() : "";
}
