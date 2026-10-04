import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageResidents } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const EDITABLE_FIELDS = ["roomNumber", "dateOfBirth", "admittedAt", "nhsNumber", "customReference"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];
const DATE_FIELDS: readonly string[] = ["dateOfBirth", "admittedAt"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageResidents(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await parseJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { field, value } = body as { field?: string; value?: string };

  if (!field || !(EDITABLE_FIELDS as readonly string[]).includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }
  const key = field as EditableField;

  const data: Record<string, unknown> = {};
  if (DATE_FIELDS.includes(key)) {
    if (!value) return NextResponse.json({ error: "Missing value" }, { status: 400 });
    data[key] = new Date(value);
  } else {
    data[key] = value?.trim() || null;
  }

  const resident = await prisma.resident.update({ where: { id }, data });

  await logAudit({
    userId: session.user.id,
    action: "resident.update_field",
    entityType: "Resident",
    entityId: id,
    metadata: { field: key },
  });

  return NextResponse.json(resident);
}
