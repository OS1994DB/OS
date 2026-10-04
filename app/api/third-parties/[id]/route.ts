import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

// Mark a service inactive/active (history is kept).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePpp(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = await parseJsonBody(req);
  if (typeof parsed?.active !== "boolean") return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  if (!(await prisma.thirdParty.findUnique({ where: { id }, select: { id: true } }))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.thirdParty.update({ where: { id }, data: { active: parsed.active } });
  await logAudit({ userId: session.user.id, action: parsed.active ? "thirdparty.reactivate" : "thirdparty.deactivate", entityType: "ThirdParty", entityId: id });
  return NextResponse.json({ ok: true });
}
