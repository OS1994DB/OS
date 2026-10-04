import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { THIRD_PARTY_CODES } from "@/lib/thirdParties";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePpp(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { name, category, contactName, phone, email, notes, renewalDate } = parsed as Record<string, unknown>;
  const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  if (!str(name) || typeof category !== "string" || !THIRD_PARTY_CODES.includes(category)) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }
  let renewal: Date | null = null;
  if (typeof renewalDate === "string" && renewalDate) {
    renewal = new Date(renewalDate);
    if (isNaN(renewal.getTime())) return NextResponse.json({ error: "Invalid renewal date" }, { status: 400 });
  }
  const row = await prisma.thirdParty.create({
    data: {
      name: str(name, 150), category, contactName: str(contactName, 150), phone: str(phone, 50),
      email: str(email, 150), notes: str(notes, 1000), renewalDate: renewal, createdById: session.user.id,
    },
  });
  await logAudit({ userId: session.user.id, action: "thirdparty.create", entityType: "ThirdParty", entityId: row.id, metadata: { name: row.name, category } });
  return NextResponse.json(row, { status: 201 });
}
