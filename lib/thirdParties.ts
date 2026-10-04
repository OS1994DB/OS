export const THIRD_PARTY_CATEGORIES = [
  { code: "GP", label: "GP / medical" },
  { code: "PHARMACY", label: "Pharmacy" },
  { code: "NURSING", label: "District nursing" },
  { code: "THERAPY", label: "Therapy (physio, podiatry...)" },
  { code: "DENTAL_OPTICAL", label: "Dental / optical" },
  { code: "SOCIAL_CARE", label: "Social care / safeguarding" },
  { code: "CONTRACTOR", label: "Maintenance contractor" },
  { code: "UTILITIES", label: "Utilities & compliance" },
  { code: "CATERING_LAUNDRY", label: "Catering / laundry" },
  { code: "OTHER", label: "Other" },
] as const;

export const THIRD_PARTY_CODES: readonly string[] = THIRD_PARTY_CATEGORIES.map((c) => c.code);
