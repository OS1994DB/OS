import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageTemplates } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { validateTemplateInput } from "@/lib/templates";

// Update the definition (bumps version; past submissions keep their own snapshot)
// or just toggle `active`.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTemplates(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const existing = await prisma.checklistTemplate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (typeof parsed.active === "boolean" && !("items" in parsed)) {
    await prisma.checklistTemplate.update({ where: { id }, data: { active: parsed.active } });
    await logAudit({ userId: session.user.id, action: parsed.active ? "template.activate" : "template.deactivate", entityType: "ChecklistTemplate", entityId: id });
    return NextResponse.json({ ok: true });
  }

  const v = validateTemplateInput(parsed);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  await prisma.checklistTemplate.update({
    where: { id },
    data: {
      name: v.name, description: v.description, items: JSON.stringify(v.items),
      areas: JSON.stringify(v.areas), version: existing.version + 1,
    },
  });
  await logAudit({ userId: session.user.id, action: "template.update", entityType: "ChecklistTemplate", entityId: id, metadata: { version: existing.version + 1 } });
  return NextResponse.json({ ok: true });
}
