export const HOUSEKEEPING_TASKS = [
  { code: "DAILY_CLEAN", label: "Daily clean" },
  { code: "DEEP_CLEAN", label: "Deep clean" },
  { code: "LAUNDRY", label: "Laundry" },
  { code: "BEDDING_CHANGE", label: "Bedding change" },
  { code: "INFECTION_CLEAN", label: "Infection-control clean" },
  { code: "WASTE", label: "Waste removal" },
  { code: "OTHER", label: "Other" },
] as const;

export const HOUSEKEEPING_CODES: readonly string[] = HOUSEKEEPING_TASKS.map((t) => t.code);
