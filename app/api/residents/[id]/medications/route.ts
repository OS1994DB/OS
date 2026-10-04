import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageMedications } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const ROUTES: readonly string[] = ["ORAL", "TOPICAL", "INHALED", "INJECTION", "OTHER"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageMedications(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { name, dose, route, frequency, instructions, prn } = parsed as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim() || typeof dose !== "string" || !dose.trim() ||
      typeof frequency !== "string" || !frequency.trim() || typeof route !== "string" || !ROUTES.includes(route)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (!(await prisma.resident.findUnique({ where: { id }, select: { id: true } }))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const med = await prisma.medication.create({
    data: {
      residentId: id,
      name: name.trim(),
      dose: dose.trim(),
      route,
      frequency: frequency.trim(),
      instructions: typeof instructions === "string" ? instructions.trim() : "",
      prn: prn === true,
      createdById: session.user.id,
    },
  });
  await logAudit({ userId: session.user.id, action: "medication.create", entityType: "Medication", entityId: med.id, metadata: { residentId: id, name: med.name } });
  return NextResponse.json(med, { status: 201 });
}
