import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCompleteTemplate } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { AREA_CODES, evaluateAnswers, parseAreas, parseItems } from "@/lib/templates";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { templateId, area, residentId, location, answers, notes } = parsed as Record<string, unknown>;
  if (typeof templateId !== "string" || typeof area !== "string" || !AREA_CODES.includes(area)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (!canCompleteTemplate(session.user.role, area)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const template = await prisma.checklistTemplate.findUnique({ where: { id: templateId } });
  if (!template || !template.active) return NextResponse.json({ error: "Template not found or inactive" }, { status: 404 });
  if (!parseAreas(template.areas).includes(area)) {
    return NextResponse.json({ error: "This template is not allocated to that area" }, { status: 400 });
  }

  let resId: string | null = null;
  if (area === "RISK_ASSESSMENT") {
    if (typeof residentId !== "string" || !(await prisma.resident.findUnique({ where: { id: residentId }, select: { id: true } }))) {
      return NextResponse.json({ error: "Choose a resident for a risk assessment" }, { status: 400 });
    }
    resId = residentId;
  }

  const ev = evaluateAnswers(parseItems(template.items), answers);
  if (!ev.ok) return NextResponse.json({ error: ev.error }, { status: 400 });

  const row = await prisma.checklistSubmission.create({
    data: {
      templateId, templateName: template.name, templateVersion: template.version, area,
      residentId: resId,
      location: typeof location === "string" ? location.trim().slice(0, 150) : "",
      answers: JSON.stringify(ev.snapshot), result: ev.result,
      notes: typeof notes === "string" ? notes.trim().slice(0, 1000) : "",
      completedById: session.user.id,
    },
  });
  await logAudit({ userId: session.user.id, action: "template.submit", entityType: "ChecklistSubmission", entityId: row.id, metadata: { templateId, area, result: ev.result, residentId: resId } });
  return NextResponse.json({ id: row.id, result: row.result }, { status: 201 });
}
