import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditCarePlans } from "@/lib/permissions";
import { CARE_PLAN_CATEGORY_CODES } from "@/lib/carePlanCategories";
import { CARE_PLAN_TABS } from "@/components/carePlanIcons";
import { addMonths } from "@/lib/dateMath";
import { ResidentSubpageHeader } from "@/components/ResidentSubpageHeader";
import { CarePlanCategoryEditor, type ReviewStatus } from "@/components/CarePlanCategoryEditor";

const DUE_SOON_WINDOW_DAYS = 7;

export default async function CarePlanCategoryPage({
  params,
}: {
  params: Promise<{ id: string; category: string }>;
}) {
  const { id, category } = await params;
  const categoryCode = category.toUpperCase();
  if (!CARE_PLAN_CATEGORY_CODES.includes(categoryCode)) notFound();

  const tab = CARE_PLAN_TABS.find((t) => t.code === categoryCode)!;

  const session = await getServerSession(authOptions);
  const role = session!.user.role;

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();

  const [versions, reviews, consentEntries] = await Promise.all([
    prisma.carePlanVersion.findMany({
      where: { residentId: id, category: categoryCode },
      orderBy: { version: "desc" },
      include: { createdBy: true },
    }),
    prisma.carePlanReview.findMany({
      where: { residentId: id, category: categoryCode },
      orderBy: { createdAt: "desc" },
      include: { reviewedBy: true },
    }),
    prisma.consentEntry.findMany({
      where: { residentId: id, category: categoryCode },
      orderBy: { dateLogged: "desc" },
    }),
  ]);

  const [latestVersion, ...olderVersions] = versions;

  const latest = latestVersion
    ? {
        version: latestVersion.version,
        identifiedRisk: latestVersion.identifiedRisk,
        residentPerspective: latestVersion.residentPerspective,
        careSupport: latestVersion.careSupport,
        careDirective: latestVersion.careDirective,
        reviewSummary: latestVersion.reviewSummary,
        createdAt: latestVersion.createdAt.toISOString(),
      }
    : null;

  const history = olderVersions.map((v) => ({
    version: v.version,
    identifiedRisk: v.identifiedRisk,
    residentPerspective: v.residentPerspective,
    careSupport: v.careSupport,
    careDirective: v.careDirective,
    reviewSummary: v.reviewSummary,
    createdAt: v.createdAt.toISOString(),
    createdBy: { name: v.createdBy.name },
  }));

  const reviewBaseline = reviews[0]?.createdAt ?? latestVersion?.createdAt ?? null;
  const reviewDueDate = reviewBaseline ? addMonths(reviewBaseline, 1) : null;

  let reviewStatus: ReviewStatus = "none";
  if (reviewDueDate) {
    const msUntilDue = reviewDueDate.getTime() - Date.now();
    const daysUntilDue = msUntilDue / (1000 * 60 * 60 * 24);
    if (msUntilDue <= 0) reviewStatus = "overdue";
    else if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) reviewStatus = "due_soon";
    else reviewStatus = "ok";
  }

  return (
    <div>
      <ResidentSubpageHeader
        residentId={resident.id}
        residentName={resident.name}
        title={tab.label}
        backHref={`/dashboard/residents/${id}/care-plan`}
        backLabel="Care plan"
      />
      <CarePlanCategoryEditor
        residentId={id}
        category={categoryCode}
        label={tab.label}
        canEdit={canEditCarePlans(role)}
        latest={latest}
        history={history}
        consentEntries={consentEntries.map((c) => ({
          id: c.id,
          type: c.type as "BEST_INTEREST" | "SOUGHT",
          dateLogged: c.dateLogged.toISOString(),
          reviewDate: c.reviewDate ? c.reviewDate.toISOString() : null,
          supportDecision: c.supportDecision,
        }))}
        reviews={reviews.map((r) => ({
          id: r.id,
          notes: r.notes,
          createdAt: r.createdAt.toISOString(),
          reviewedBy: { name: r.reviewedBy.name },
        }))}
        reviewDueDate={reviewDueDate ? reviewDueDate.toISOString() : null}
        reviewStatus={reviewStatus}
      />
    </div>
  );
}
