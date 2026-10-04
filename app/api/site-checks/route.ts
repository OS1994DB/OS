import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { SITE_CHECK_CODES } from "@/lib/siteChecks";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { type, area, result, notes } = parsed as Record<string, unknown>;
  if (typeof type !== "string" || !SITE_CHECK_CODES.includes(type) || (result !== "PASS" && result !== "FAIL")) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  const noteText = typeof notes === "string" ? notes.trim() : "";
  if (result === "FAIL" && !noteText) {
    return NextResponse.json({ error: "Please describe the problem for a failed check" }, { status: 400 });
  }

  const check = await prisma.siteCheck.create({
    data: { type, result, area: typeof area === "string" ? area.trim() : "", notes: noteText, checkedById: session.user.id },
  });
  await logAudit({ userId: session.user.id, action: "sitecheck.create", entityType: "SiteCheck", entityId: check.id, metadata: { type, result } });
  return NextResponse.json(check, { status: 201 });
}
