import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  const { change, note } = (parsed ?? {}) as Record<string, unknown>;
  if (typeof change !== "number" || !Number.isInteger(change) || change === 0 || Math.abs(change) > 100000) {
    return NextResponse.json({ error: "Enter a whole number other than zero" }, { status: 400 });
  }
  if (!(await prisma.ppeItem.findUnique({ where: { id }, select: { id: true } }))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (change < 0) {
    const agg = await prisma.ppeMovement.aggregate({ where: { itemId: id }, _sum: { change: true } });
    if ((agg._sum.change ?? 0) + change < 0) {
      return NextResponse.json({ error: "Not enough stock on hand" }, { status: 400 });
    }
  }
  const m = await prisma.ppeMovement.create({
    data: { itemId: id, change, note: typeof note === "string" ? note.trim() : "", byId: session.user.id },
  });
  await logAudit({ userId: session.user.id, action: "ppe.movement", entityType: "PpeMovement", entityId: m.id, metadata: { itemId: id, change } });
  return NextResponse.json(m, { status: 201 });
}
