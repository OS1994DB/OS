export type Role = "MANAGER" | "SENIOR_CARER" | "CARER";

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
