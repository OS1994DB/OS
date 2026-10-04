import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const INCIDENT_TYPES = ["FALL", "NEAR_MISS", "ACCIDENT", "BEHAVIOUR", "MEDICATION", "SAFEGUARDING", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { residentId, type, severity, occurredAt, location, description, actionTaken } = parsed as Record<string, unknown>;

  const when = typeof occurredAt === "string" ? new Date(occurredAt) : null;
  if (typeof type !== "string" || !INCIDENT_TYPES.includes(type) ||
      typeof severity !== "string" || !SEVERITIES.includes(severity) ||
      !when || isNaN(when.getTime()) || when.getTime() > Date.now() + 5 * 60_000 ||
      typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  // Incidents are personal to a resident.
  if (typeof residentId !== "string" || !(await prisma.resident.findUnique({ where: { id: residentId }, select: { id: true } }))) {
    return NextResponse.json({ error: "Choose a resident" }, { status: 400 });
  }
  const resId = residentId;

  const incident = await prisma.incident.create({
    data: {
      residentId: resId, type, severity, occurredAt: when,
      location: typeof location === "string" ? location.trim() : "",
      description: description.trim(),
      actionTaken: typeof actionTaken === "string" ? actionTaken.trim() : "",
      reportedById: session.user.id,
    },
  });
  await logAudit({ userId: session.user.id, action: "incident.create", entityType: "Incident", entityId: incident.id, metadata: { residentId: resId, type, severity } });
  return NextResponse.json(incident, { status: 201 });
}
