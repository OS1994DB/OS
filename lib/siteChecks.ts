export const SITE_CHECK_TYPES = [
  { code: "FIRE_ALARM", label: "Fire alarm test", everyDays: 7 },
  { code: "FIRE_DOORS", label: "Fire doors", everyDays: 7 },
  { code: "EMERGENCY_LIGHTING", label: "Emergency lighting", everyDays: 30 },
  { code: "WATER_TEMPERATURE", label: "Water temperatures", everyDays: 7 },
  { code: "FIRE_EXTINGUISHERS", label: "Fire extinguishers", everyDays: 30 },
  { code: "HOIST_EQUIPMENT", label: "Hoists & equipment", everyDays: 30 },
  { code: "MAINTENANCE", label: "Maintenance issue", everyDays: 0 },
  { code: "OTHER", label: "Other", everyDays: 0 },
] as const;

export const SITE_CHECK_CODES: readonly string[] = SITE_CHECK_TYPES.map((t) => t.code);
