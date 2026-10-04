export const CARE_PLAN_CATEGORIES = [
  { code: "MOBILITY", label: "Mobility and Transferring" },
  { code: "SKIN_CARE", label: "Skin Care" },
  { code: "PERSONAL_HYGIENE", label: "Personal Hygiene" },
  { code: "PERSONAL_PRESENTATION", label: "Personal Presentation" },
  { code: "ORAL_CARE", label: "Oral Care" },
  { code: "HAND_FOOT_CARE", label: "Hand and Foot Care" },
  { code: "CONTINENCE_CARE", label: "Continence Care" },
  { code: "COMMUNICATION", label: "Communication" },
  { code: "EYESIGHT_HEARING", label: "Eyesight and Hearing" },
  { code: "BREATHING", label: "Breathing" },
  { code: "DIETARY_REQUIREMENTS", label: "Dietary Requirements" },
  { code: "EATING_DRINKING", label: "Eating and Drinking" },
  { code: "SWALLOWING", label: "Swallowing" },
  { code: "NIGHT_CARE_SLEEPING", label: "Night Care and Sleeping" },
  { code: "MEDICATION", label: "Medication" },
  { code: "MEDICAL_CONDITIONS", label: "Medical Conditions and Health" },
  { code: "CAPACITY_DECISIONS", label: "Capacity and Decision Making" },
  { code: "BEHAVIOUR", label: "Behaviour" },
  { code: "PAIN", label: "Pain" },
  { code: "INFECTION_PREVENTION", label: "Infection Prevention and Control" },
  { code: "SOCIAL_ACTIVITIES", label: "Social/Activities" },
  { code: "COMMUNITY_APPOINTMENTS", label: "Accessing the community/Appointments" },
  { code: "SAFETY_ENVIRONMENT", label: "Safety and Environment" },
  { code: "END_OF_LIFE", label: "End of Life" },
] as const;

export type CarePlanCategoryCode = (typeof CARE_PLAN_CATEGORIES)[number]["code"];

export const CARE_PLAN_CATEGORY_CODES: readonly string[] = CARE_PLAN_CATEGORIES.map((c) => c.code);
