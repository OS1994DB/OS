import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditCarePlans } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { CARE_PLAN_CATEGORY_CODES } from "@/lib/carePlanCategories";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEditCarePlans(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { category, notes } = parsed as { category?: string; notes?: string };

  if (!category || !CARE_PLAN_CATEGORY_CODES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!notes || typeof notes !== "string" || !notes.trim()) {
    return NextResponse.json({ error: "Missing notes" }, { status: 400 });
  }

  const review = await prisma.carePlanReview.create({
    data: {
      residentId: id,
      category,
      notes,
      reviewedById: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "careplan.create_review",
    entityType: "CarePlanReview",
    entityId: review.id,
    metadata: { residentId: id, category },
  });

  return NextResponse.json(review, { status: 201 });
}
