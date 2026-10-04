import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canReviewIncidents } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canReviewIncidents(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  const notes = typeof parsed?.notes === "string" ? parsed.notes.trim() : "";
  if (!notes) return NextResponse.json({ error: "Review notes are required" }, { status: 400 });

  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (incident.status === "REVIEWED") return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  await prisma.incident.update({
    where: { id },
    data: { status: "REVIEWED", reviewedById: session.user.id, reviewedAt: new Date(), reviewNotes: notes },
  });
  await logAudit({ userId: session.user.id, action: "incident.review", entityType: "Incident", entityId: id });
  return NextResponse.json({ ok: true });
}
