import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePpp(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  const name = typeof parsed?.name === "string" ? parsed.name.trim() : "";
  const parentId = typeof parsed?.parentId === "string" && parsed.parentId ? parsed.parentId : null;
  if (!name || name.length > 100) return NextResponse.json({ error: "Folder name must be 1–100 characters" }, { status: 400 });
  if (parentId && !(await prisma.pppFolder.findUnique({ where: { id: parentId }, select: { id: true } }))) {
    return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
  }
  const dupe = await prisma.pppFolder.findFirst({ where: { parentId, name } });
  if (dupe) return NextResponse.json({ error: "A folder with that name already exists here" }, { status: 409 });

  const folder = await prisma.pppFolder.create({ data: { name, parentId } });
  await logAudit({ userId: session.user.id, action: "ppp.folder_create", entityType: "PppFolder", entityId: folder.id, metadata: { name } });
  return NextResponse.json(folder, { status: 201 });
}
