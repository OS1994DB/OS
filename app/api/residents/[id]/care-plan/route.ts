import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditCarePlans } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyStaff } from "@/lib/staffMessages";
import { parseJsonBody } from "@/lib/request";
import { CARE_PLAN_CATEGORIES, CARE_PLAN_CATEGORY_CODES } from "@/lib/carePlanCategories";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEditCarePlans(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { category, identifiedRisk, residentPerspective, careSupport, careDirective, reviewSummary } = parsed as {
    category?: string;
    identifiedRisk?: string;
    residentPerspective?: string;
    careSupport?: string;
    careDirective?: string;
    reviewSummary?: string;
  };

  if (!category || !CARE_PLAN_CATEGORY_CODES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (
    typeof identifiedRisk !== "string" ||
    typeof residentPerspective !== "string" ||
    typeof careSupport !== "string" ||
    typeof careDirective !== "string" ||
    typeof reviewSummary !== "string"
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (
    !identifiedRisk.trim() &&
    !residentPerspective.trim() &&
    !careSupport.trim() &&
    !careDirective.trim() &&
    !reviewSummary.trim()
  ) {
    return NextResponse.json({ error: "Enter at least one field" }, { status: 400 });
  }

  const latest = await prisma.carePlanVersion.findFirst({
    where: { residentId: id, category },
    orderBy: { version: "desc" },
  });

  const unchanged =
    !!latest &&
    latest.identifiedRisk === identifiedRisk &&
    latest.residentPerspective === residentPerspective &&
    latest.careSupport === careSupport &&
    latest.careDirective === careDirective &&
    latest.reviewSummary === reviewSummary;

  if (unchanged) {
    return NextResponse.json({ unchanged: true, version: latest }, { status: 200 });
  }

  const version = await prisma.carePlanVersion.create({
    data: {
      residentId: id,
      category,
      version: (latest?.version ?? 0) + 1,
      identifiedRisk,
      residentPerspective,
      careSupport,
      careDirective,
      reviewSummary,
      createdById: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "careplan.create_version",
    entityType: "CarePlanVersion",
    entityId: version.id,
    metadata: { residentId: id, category, version: version.version },
  });

  const resident = await prisma.resident.findUnique({ where: { id }, select: { name: true } });
  const categoryLabel = CARE_PLAN_CATEGORIES.find((c) => c.code === category)?.label ?? category;

  await notifyStaff({
    body: `${session.user.name} updated the "${categoryLabel}" care plan for ${resident?.name ?? "a resident"}.`,
    residentId: id,
    createdById: session.user.id,
  });

  return NextResponse.json(version, { status: 201 });
}
