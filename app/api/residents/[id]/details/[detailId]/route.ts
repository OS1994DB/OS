import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; detailId: string }> }
) {
  const { id, detailId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const detail = await prisma.residentDetail.findUnique({ where: { id: detailId } });
  if (!detail || detail.residentId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.residentDetail.delete({ where: { id: detailId } });

  await logAudit({
    userId: session.user.id,
    action: "resident_detail.delete",
    entityType: "ResidentDetail",
    entityId: detail.id,
    metadata: { residentId: id, section: detail.section, content: detail.content },
  });

  return NextResponse.json({ ok: true });
}
