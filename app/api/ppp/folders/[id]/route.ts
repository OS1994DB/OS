import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

// Delete a folder. An empty folder goes straight away. A folder with contents
// needs ?confirm=true, and then everything inside it (files and subfolders) is
// deleted too; without it we answer 409 with the counts so the UI can ask.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePpp(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const folder = await prisma.pppFolder.findUnique({ where: { id } });
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Collect this folder and all descendants.
  const ids = [id];
  for (let i = 0; i < ids.length; i++) {
    const kids = await prisma.pppFolder.findMany({ where: { parentId: ids[i] }, select: { id: true } });
    for (const k of kids) if (!ids.includes(k.id)) ids.push(k.id);
  }
  const fileCount = await prisma.pppFile.count({ where: { folderId: { in: ids } } });
  const subfolderCount = ids.length - 1;

  const confirmed = new URL(req.url).searchParams.get("confirm") === "true";
  if ((fileCount > 0 || subfolderCount > 0) && !confirmed) {
    return NextResponse.json({ error: "Folder is not empty", needsConfirm: true, fileCount, subfolderCount }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.pppFile.deleteMany({ where: { folderId: { in: ids } } }),
    prisma.pppFolder.deleteMany({ where: { id: { in: ids } } }),
  ]);
  await logAudit({
    userId: session.user.id,
    action: "ppp.folder_delete",
    entityType: "PppFolder",
    entityId: id,
    metadata: { name: folder.name, parentId: folder.parentId, filesDeleted: fileCount, subfoldersDeleted: subfolderCount },
  });
  return NextResponse.json({ ok: true, parentId: folder.parentId });
}
