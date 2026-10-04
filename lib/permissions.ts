export type Role = "MANAGER" | "SENIOR_CARER" | "CARER" | "HOUSEKEEPING" | "COOK";

export const ALL_ROLES: readonly string[] = ["CARER", "SENIOR_CARER", "MANAGER", "HOUSEKEEPING", "COOK"];

// Non-care staff: no access to resident records, incidents, audits, messages
// or the services register (enforced in middleware.ts as well as the UI).
export function isLimitedRole(role: string | undefined | null) {
  return role === "HOUSEKEEPING" || role === "COOK";
}

export function roleLabel(role: string) {
  return role.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function canEditCarePlans(role: string) {
  return role === "MANAGER" || role === "SENIOR_CARER";
}

export function canManageResidents(role: string) {
  return role === "MANAGER" || role === "SENIOR_CARER";
}

export function canAddAssessments(role: string) {
  return role === "MANAGER" || role === "SENIOR_CARER";
}

export function canManageStaff(role: string) {
  return role === "MANAGER";
}

export function canManageMedications(role: string) {
  return role === "MANAGER" || role === "SENIOR_CARER";
}

export function canReviewIncidents(role: string) {
  return role === "MANAGER";
}

export function canManagePpp(role: string) {
  return role === "MANAGER" || role === "SENIOR_CARER";
}

export function canManageHandover(role: string) {
  return role === "MANAGER" || role === "SENIOR_CARER";
}

export function canManageTemplates(role: string) {
  return role === "MANAGER";
}

// Who may complete a template in a given area.
export function canCompleteTemplate(role: string, area: string) {
  if (area === "RISK_ASSESSMENT" || area === "AUDIT") return role === "MANAGER" || role === "SENIOR_CARER";
  return true;
}
