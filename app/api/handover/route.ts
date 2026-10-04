import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageHandover } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageHandover(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { kind, priority, title, body } = parsed as Record<string, unknown>;
  const t = typeof title === "string" ? title.trim() : "";
  if ((kind !== "NOTICE" && kind !== "TASK") || !t || t.length > 200) {
    return NextResponse.json({ error: "Choose notice or task and enter a title (max 200 characters)" }, { status: 400 });
  }
  const item = await prisma.handoverItem.create({
    data: {
      kind, title: t,
      priority: priority === "URGENT" ? "URGENT" : "NORMAL",
      body: typeof body === "string" ? body.trim().slice(0, 2000) : "",
      createdById: session.user.id,
    },
  });
  await logAudit({ userId: session.user.id, action: "handover.create", entityType: "HandoverItem", entityId: item.id, metadata: { kind, priority: item.priority } });
  return NextResponse.json(item, { status: 201 });
}
