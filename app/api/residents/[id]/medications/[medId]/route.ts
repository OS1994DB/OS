import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageMedications } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

// Stop a medication (kept in history, no longer shown on the active chart).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; medId: string }> }) {
  const { id, medId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageMedications(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = await parseJsonBody(req);
  const reason = typeof parsed?.reason === "string" ? parsed.reason.trim() : "";
  if (!reason) return NextResponse.json({ error: "A reason for stopping is required" }, { status: 400 });

  const med = await prisma.medication.findFirst({ where: { id: medId, residentId: id } });
  if (!med) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!med.active) return NextResponse.json({ error: "Already stopped" }, { status: 409 });

  await prisma.medication.update({ where: { id: medId }, data: { active: false, stoppedAt: new Date(), stoppedReason: reason } });
  await logAudit({ userId: session.user.id, action: "medication.stop", entityType: "Medication", entityId: medId, metadata: { residentId: id, reason } });
  return NextResponse.json({ ok: true });
}
