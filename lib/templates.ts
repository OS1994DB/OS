export const TEMPLATE_AREAS = [
  { code: "SITE", label: "Site checks" },
  { code: "RISK_ASSESSMENT", label: "Risk assessments" },
  { code: "HOUSEKEEPING", label: "Housekeeping" },
  { code: "AUDIT", label: "Audits" },
] as const;
export type TemplateArea = (typeof TEMPLATE_AREAS)[number]["code"];
export const AREA_CODES: readonly string[] = TEMPLATE_AREAS.map((a) => a.code);

export const ITEM_TYPES = [
  { code: "PASS_FAIL", label: "Pass / Fail / N/A", options: ["PASS", "FAIL", "NA"], flag: "FAIL" },
  { code: "YES_NO", label: "Yes / No / N/A", options: ["YES", "NO", "NA"], flag: "NO" },
  { code: "RATING", label: "Risk rating (Low / Medium / High)", options: ["LOW", "MEDIUM", "HIGH"], flag: "HIGH" },
  { code: "TEXT", label: "Free text", options: [], flag: null },
  { code: "NUMBER", label: "Number (e.g. temperature)", options: [], flag: null },
] as const;
export type ItemType = (typeof ITEM_TYPES)[number]["code"];

export type TemplateItem = { id: string; text: string; type: ItemType; required: boolean };
export type AnswerInput = { itemId: string; value: string; note?: string };
export type StoredAnswer = { id: string; text: string; type: ItemType; value: string; note: string; flagged: boolean };

const typeDef = (t: string) => ITEM_TYPES.find((x) => x.code === t);

export function parseItems(json: string): TemplateItem[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export function parseAreas(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((a) => AREA_CODES.includes(a)) : [];
  } catch {
    return [];
  }
}
export function parseAnswers(json: string): StoredAnswer[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Validates a template definition coming from the builder. Returns cleaned data or an error.
export function validateTemplateInput(input: Record<string, unknown>):
  | { ok: true; name: string; description: string; items: TemplateItem[]; areas: string[] }
  | { ok: false; error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length > 150) return { ok: false, error: "Template name is required (max 150 characters)" };
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 1000) : "";
  const areas = Array.isArray(input.areas) ? [...new Set(input.areas.filter((a): a is string => typeof a === "string" && AREA_CODES.includes(a)))] : [];
  if (areas.length === 0) return { ok: false, error: "Allocate the template to at least one area" };
  if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: "Add at least one question" };
  if (input.items.length > 100) return { ok: false, error: "A template can have at most 100 questions" };

  const items: TemplateItem[] = [];
  for (const raw of input.items as Record<string, unknown>[]) {
    const text = typeof raw?.text === "string" ? raw.text.trim() : "";
    const type = typeof raw?.type === "string" ? raw.type : "";
    if (!text || text.length > 300) return { ok: false, error: "Every question needs text (max 300 characters)" };
    if (!typeDef(type)) return { ok: false, error: "Invalid question type" };
    const id = typeof raw.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.id) ? raw.id : `q${items.length + 1}`;
    if (items.some((i) => i.id === id)) return { ok: false, error: "Duplicate question id" };
    items.push({ id, text, type: type as ItemType, required: raw.required !== false });
  }
  return { ok: true, name, description, items, areas };
}

// Checks submitted answers against the template and builds the stored snapshot.
export function evaluateAnswers(items: TemplateItem[], answers: unknown):
  | { ok: true; snapshot: StoredAnswer[]; result: "PASS" | "ACTION_NEEDED" }
  | { ok: false; error: string } {
  const byId = new Map<string, AnswerInput>();
  if (Array.isArray(answers)) {
    for (const a of answers as AnswerInput[]) if (a && typeof a.itemId === "string") byId.set(a.itemId, a);
  }
  const snapshot: StoredAnswer[] = [];
  for (const item of items) {
    const a = byId.get(item.id);
    const value = typeof a?.value === "string" ? a.value.trim() : "";
    const note = typeof a?.note === "string" ? a.note.trim().slice(0, 1000) : "";
    const def = typeDef(item.type)!;
    if (!value) {
      if (item.required) return { ok: false, error: `Please answer: ${item.text}` };
      continue;
    }
    if (def.options.length > 0 && !(def.options as readonly string[]).includes(value)) {
      return { ok: false, error: `Invalid answer for: ${item.text}` };
    }
    if (item.type === "NUMBER" && !Number.isFinite(Number(value))) return { ok: false, error: `Enter a number for: ${item.text}` };
    if (item.type === "TEXT" && value.length > 2000) return { ok: false, error: `Answer too long: ${item.text}` };
    const flagged = def.flag !== null && value === def.flag;
    if (flagged && !note) return { ok: false, error: `Add a note explaining: ${item.text}` };
    snapshot.push({ id: item.id, text: item.text, type: item.type, value, note, flagged });
  }
  return { ok: true, snapshot, result: snapshot.some((s) => s.flagged) ? "ACTION_NEEDED" : "PASS" };
}
