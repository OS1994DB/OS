import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const f = await prisma.pppFile.findUnique({ where: { id } });
  if (!f) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Always an attachment + nosniff: uploads are never rendered in our origin.
  return new Response(new Uint8Array(f.data), {
    headers: {
      "Content-Type": f.mimeType,
      "Content-Length": String(f.size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Move a file to another folder.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePpp(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  if (!parsed || !("folderId" in parsed)) return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
  const folderId = typeof parsed.folderId === "string" && parsed.folderId ? parsed.folderId : null;
  if (!folderId) return NextResponse.json({ error: "Choose a folder" }, { status: 400 });
  if (!(await prisma.pppFolder.findUnique({ where: { id: folderId }, select: { id: true } }))) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }
  const f = await prisma.pppFile.findUnique({ where: { id }, select: { id: true, folderId: true } });
  if (!f) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.pppFile.update({ where: { id }, data: { folderId } });
  await logAudit({ userId: session.user.id, action: "ppp.file_move", entityType: "PppFile", entityId: id, metadata: { from: f.folderId, to: folderId } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePpp(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const f = await prisma.pppFile.findUnique({ where: { id }, select: { id: true, name: true, folderId: true } });
  if (!f) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.pppFile.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "ppp.file_delete", entityType: "PppFile", entityId: id, metadata: { name: f.name, folderId: f.folderId } });
  return NextResponse.json({ ok: true });
}
