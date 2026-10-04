import { prisma } from "@/lib/prisma";
import type { IncidentRow } from "@/components/IncidentList";

export async function loadIncidents(where: { residentId?: string; status?: string }): Promise<IncidentRow[]> {
  const rows = await prisma.incident.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { resident: true, reportedBy: true, reviewedBy: true },
  });
  return rows.map((i) => ({
    id: i.id, type: i.type, severity: i.severity, occurredAt: i.occurredAt, location: i.location,
    description: i.description, actionTaken: i.actionTaken, status: i.status, reviewNotes: i.reviewNotes,
    reviewedAt: i.reviewedAt, reviewedByName: i.reviewedBy?.name ?? null, reportedByName: i.reportedBy.name,
    resident: i.resident ? { id: i.resident.id, name: i.resident.name } : null,
  }));
}
