import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const SECTIONS: readonly string[] = ["INFO", "ALLERGY", "MEDICATION", "GP", "CONDITION", "ABOUT_ME"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await parseJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { section, content } = body as { section?: string; content?: string };

  if (!section || !SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const detail = await prisma.residentDetail.create({
    data: { residentId: id, section, content: content.trim(), createdById: session.user.id },
  });

  await logAudit({
    userId: session.user.id,
    action: "resident_detail.create",
    entityType: "ResidentDetail",
    entityId: detail.id,
    metadata: { residentId: id, section },
  });

  return NextResponse.json(detail, { status: 201 });
}
