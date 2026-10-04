import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { HOUSEKEEPING_CODES } from "@/lib/housekeeping";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { task, area, status, notes } = parsed as Record<string, unknown>;
  if (typeof task !== "string" || !HOUSEKEEPING_CODES.includes(task) ||
      typeof area !== "string" || !area.trim() ||
      (status !== "DONE" && status !== "NEEDS_ATTENTION")) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  const noteText = typeof notes === "string" ? notes.trim() : "";
  if (status === "NEEDS_ATTENTION" && !noteText) {
    return NextResponse.json({ error: "Please say what needs attention" }, { status: 400 });
  }
  const row = await prisma.housekeepingLog.create({
    data: { task, area: area.trim(), status, notes: noteText, doneById: session.user.id },
  });
  await logAudit({ userId: session.user.id, action: "housekeeping.create", entityType: "HousekeepingLog", entityId: row.id, metadata: { task, status } });
  return NextResponse.json(row, { status: 201 });
}
