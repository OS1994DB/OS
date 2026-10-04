import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageHandover } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

// complete / reopen: any staff member, tasks only. archive (remove): seniors and managers.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  const action = parsed?.action;
  if (action !== "complete" && action !== "reopen" && action !== "archive") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const item = await prisma.handoverItem.findUnique({ where: { id } });
  if (!item || item.archivedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "archive") {
    if (!canManageHandover(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.handoverItem.update({ where: { id }, data: { archivedAt: new Date() } });
  } else {
    if (item.kind !== "TASK") return NextResponse.json({ error: "Only tasks can be ticked off" }, { status: 400 });
    if (action === "complete") {
      if (item.completedAt) return NextResponse.json({ error: "Already completed" }, { status: 409 });
      await prisma.handoverItem.update({ where: { id }, data: { completedAt: new Date(), completedById: session.user.id } });
    } else {
      await prisma.handoverItem.update({ where: { id }, data: { completedAt: null, completedById: null } });
    }
  }
  await logAudit({ userId: session.user.id, action: `handover.${action}`, entityType: "HandoverItem", entityId: id });
  return NextResponse.json({ ok: true });
}
