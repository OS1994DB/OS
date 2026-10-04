import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { PPP_MAX_BYTES, PPP_TYPES } from "@/lib/ppp";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePpp(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  const file = form.get("file");
  const folderRaw = form.get("folderId");
  const folderId = typeof folderRaw === "string" && folderRaw ? folderRaw : null;
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose a file" }, { status: 400 });
  if (file.size > PPP_MAX_BYTES) return NextResponse.json({ error: "File is too large (max 4 MB)" }, { status: 413 });
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = PPP_TYPES[ext];
  if (!mimeType) {
    return NextResponse.json({ error: `Unsupported file type. Allowed: ${Object.keys(PPP_TYPES).join(", ")}` }, { status: 400 });
  }
  if (folderId && !(await prisma.pppFolder.findUnique({ where: { id: folderId }, select: { id: true } }))) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  const row = await prisma.pppFile.create({
    data: {
      name: file.name.slice(0, 200),
      mimeType,
      size: file.size,
      data: Buffer.from(await file.arrayBuffer()),
      folderId,
      uploadedById: session.user.id,
    },
    select: { id: true, name: true },
  });
  await logAudit({ userId: session.user.id, action: "ppp.file_upload", entityType: "PppFile", entityId: row.id, metadata: { name: row.name, folderId } });
  return NextResponse.json(row, { status: 201 });
}
