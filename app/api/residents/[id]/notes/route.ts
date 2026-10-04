import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const CATEGORIES: readonly string[] = ["GENERAL", "CARE", "HEALTH", "INCIDENT", "RISK"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { body, category } = parsed as { body?: string; category?: string };
  if (!body || typeof body !== "string") {
    return NextResponse.json({ error: "Missing note body" }, { status: 400 });
  }
  const noteCategory = category && CATEGORIES.includes(category) ? category : "GENERAL";

  const note = await prisma.note.create({
    data: {
      residentId: id,
      authorId: session.user.id,
      category: noteCategory,
      body,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "note.create",
    entityType: "Note",
    entityId: note.id,
    metadata: { residentId: id, category: noteCategory },
  });

  return NextResponse.json(note, { status: 201 });
}
