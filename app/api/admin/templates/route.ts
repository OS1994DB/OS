import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageTemplates } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { validateTemplateInput } from "@/lib/templates";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTemplates(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const v = validateTemplateInput(parsed);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const t = await prisma.checklistTemplate.create({
    data: {
      name: v.name, description: v.description, items: JSON.stringify(v.items),
      areas: JSON.stringify(v.areas), createdById: session.user.id,
    },
  });
  await logAudit({ userId: session.user.id, action: "template.create", entityType: "ChecklistTemplate", entityId: t.id, metadata: { name: t.name, areas: v.areas } });
  return NextResponse.json({ id: t.id }, { status: 201 });
}
