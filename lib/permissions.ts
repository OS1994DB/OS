export type Role = "ADMIN" | "MANAGER" | "SENIOR_CARER" | "CARER" | "HOUSEKEEPING" | "COOK";

export const ALL_ROLES: readonly string[] = ["CARER", "SENIOR_CARER", "MANAGER", "ADMIN", "HOUSEKEEPING", "COOK"];

// Non-care staff: no access to resident records, incidents, audits, messages
// or the services register (enforced in middleware.ts as well as the UI).
// Admin accounts have every manager permission.
export function isManager(role: string | undefined | null) {
  return role === "MANAGER" || role === "ADMIN";
}

export function isLimitedRole(role: string | undefined | null) {
  return role === "HOUSEKEEPING" || role === "COOK";
}

export function roleLabel(role: string) {
  return role.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function canEditCarePlans(role: string) {
  return isManager(role) || role === "SENIOR_CARER";
}

export function canManageResidents(role: string) {
  return isManager(role) || role === "SENIOR_CARER";
}

export function canAddAssessments(role: string) {
  return isManager(role) || role === "SENIOR_CARER";
}

export function canManageStaff(role: string) {
  return isManager(role);
}

export function canManageMedications(role: string) {
  return isManager(role) || role === "SENIOR_CARER";
}

export function canReviewIncidents(role: string) {
  return isManager(role);
}

export function canManagePpp(role: string) {
  return isManager(role) || role === "SENIOR_CARER";
}

export function canManageHandover(role: string) {
  return isManager(role) || role === "SENIOR_CARER";
}

export function canManageTemplates(role: string) {
  return isManager(role);
}

// Who may complete a template in a given area.
export function canCompleteTemplate(role: string, area: string) {
  if (area === "RISK_ASSESSMENT" || area === "AUDIT") return isManager(role) || role === "SENIOR_CARER";
  return true;
}
