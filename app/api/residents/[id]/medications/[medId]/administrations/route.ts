import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const OUTCOMES: readonly string[] = ["GIVEN", "REFUSED", "OMITTED", "NOT_AVAILABLE"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string; medId: string }> }) {
  const { id, medId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { outcome, notes } = parsed as { outcome?: unknown; notes?: unknown };
  if (typeof outcome !== "string" || !OUTCOMES.includes(outcome)) {
    return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
  }
  const noteText = typeof notes === "string" ? notes.trim() : "";
  if (outcome !== "GIVEN" && !noteText) {
    return NextResponse.json({ error: "A note is required when a dose is not given" }, { status: 400 });
  }

  const med = await prisma.medication.findFirst({ where: { id: medId, residentId: id } });
  if (!med) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!med.active) return NextResponse.json({ error: "This medication has been stopped" }, { status: 409 });

  const entry = await prisma.medicationAdministration.create({
    data: { medicationId: medId, residentId: id, outcome, notes: noteText, givenById: session.user.id },
  });
  await logAudit({ userId: session.user.id, action: "medication.administer", entityType: "MedicationAdministration", entityId: entry.id, metadata: { residentId: id, medicationId: medId, outcome } });
  return NextResponse.json(entry, { status: 201 });
}
