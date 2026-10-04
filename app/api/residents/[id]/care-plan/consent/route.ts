import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditCarePlans } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { CARE_PLAN_CATEGORY_CODES } from "@/lib/carePlanCategories";

const CONSENT_TYPES = ["BEST_INTEREST", "SOUGHT"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEditCarePlans(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { category, type, dateLogged, reviewDate, supportDecision } = parsed as {
    category?: string;
    type?: string;
    dateLogged?: string;
    reviewDate?: string;
    supportDecision?: string;
  };

  if (!category || !CARE_PLAN_CATEGORY_CODES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!type || !CONSENT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!dateLogged || isNaN(Date.parse(dateLogged))) {
    return NextResponse.json({ error: "Invalid date logged" }, { status: 400 });
  }
  if (reviewDate && isNaN(Date.parse(reviewDate))) {
    return NextResponse.json({ error: "Invalid review date" }, { status: 400 });
  }
  if (!supportDecision || typeof supportDecision !== "string" || !supportDecision.trim()) {
    return NextResponse.json({ error: "Missing support decision" }, { status: 400 });
  }

  const entry = await prisma.consentEntry.create({
    data: {
      residentId: id,
      category,
      type,
      dateLogged: new Date(dateLogged),
      reviewDate: reviewDate ? new Date(reviewDate) : null,
      supportDecision,
      createdById: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "careplan.consent.create",
    entityType: "ConsentEntry",
    entityId: entry.id,
    metadata: { residentId: id, category, type },
  });

  return NextResponse.json(entry, { status: 201 });
}
