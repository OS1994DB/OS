import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageMedications } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

// Senior carers and managers define which items are tracked.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageMedications(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  const { name, unit, reorderLevel } = (parsed ?? {}) as Record<string, unknown>;
  const level = Number(reorderLevel ?? 0);
  if (typeof name !== "string" || !name.trim() || !Number.isInteger(level) || level < 0) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (await prisma.ppeItem.findUnique({ where: { name: name.trim() } })) {
    return NextResponse.json({ error: "That item already exists" }, { status: 409 });
  }
  const item = await prisma.ppeItem.create({
    data: { name: name.trim(), unit: typeof unit === "string" && unit.trim() ? unit.trim() : "box", reorderLevel: level },
  });
  await logAudit({ userId: session.user.id, action: "ppe.item_create", entityType: "PpeItem", entityId: item.id });
  return NextResponse.json(item, { status: 201 });
}
