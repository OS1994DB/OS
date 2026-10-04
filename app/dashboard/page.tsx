import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/StatTile";
import { HandoverBoard } from "@/components/HandoverBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageHandover } from "@/lib/permissions";
import { ResidentsIcon, StaffIcon, NoteIcon, CarePlanIcon, SparkleIcon, ShieldIcon, BuildingIcon, HandshakeIcon } from "@/components/icons";
import { SITE_CHECK_TYPES } from "@/lib/siteChecks";

const CARE_PLAN_REVIEW_DAYS = 90;

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const reviewCutoff = new Date();
  reviewCutoff.setDate(reviewCutoff.getDate() - CARE_PLAN_REVIEW_DAYS);

  const dayAgo = new Date(Date.now() - 86_400_000);
  const in30 = new Date(Date.now() + 30 * 86_400_000);

  const [residentCount, staffByRole, notesToday, residents, latestCarePlans, handoverRaw,
    hkDone, hkLogs, pppFiles, pppFolders, siteChecks, servicesActive, servicesDue] =
    await Promise.all([
      prisma.resident.count(),
      prisma.user.groupBy({ by: ["role"], where: { active: true }, _count: true }),
      prisma.note.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.resident.findMany({ select: { id: true } }),
      prisma.carePlanVersion.findMany({
        orderBy: { version: "desc" },
        select: { residentId: true, createdAt: true },
      }),
      prisma.handoverItem.findMany({
        where: { archivedAt: null, OR: [{ completedAt: null }, { completedAt: { gte: dayAgo } }] },
        include: { createdBy: true, completedBy: true },
      }),
      prisma.housekeepingLog.count({ where: { createdAt: { gte: dayAgo }, status: "DONE" } }),
      prisma.housekeepingLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, select: { area: true, task: true, status: true } }),
      prisma.pppFile.count(),
      prisma.pppFolder.count(),
      prisma.siteCheck.findMany({ orderBy: { createdAt: "desc" }, take: 200, select: { type: true, result: true, createdAt: true } }),
      prisma.thirdParty.count({ where: { active: true } }),
      prisma.thirdParty.count({ where: { active: true, renewalDate: { not: null, lte: in30 } } }),
    ]);

  // Housekeeping: an area+task still "needs attention" if its latest entry says so.
  const hkLatest = new Map<string, string>();
  for (const l of hkLogs) {
    const k = `${l.area.toLowerCase()}|${l.task}`;
    if (!hkLatest.has(k)) hkLatest.set(k, l.status);
  }
  const hkAttention = [...hkLatest.values()].filter((v) => v === "NEEDS_ATTENTION").length;

  // Site: scheduled checks overdue + checks whose latest result failed.
  const siteLatest = new Map<string, { result: string; createdAt: Date }>();
  for (const c of siteChecks) if (!siteLatest.has(c.type)) siteLatest.set(c.type, c);
  const siteScheduled = SITE_CHECK_TYPES.filter((t) => t.everyDays > 0);
  const siteOverdue = siteScheduled.filter((t) => {
    const last = siteLatest.get(t.code);
    return !last || Date.now() - last.createdAt.getTime() > t.everyDays * 86_400_000;
  }).length;
  const siteFailing = [...siteLatest.values()].filter((c) => c.result === "FAIL").length;
  const siteIssues = siteOverdue + siteFailing;

  // Urgent first, open before done, newest first.
  const handover = [...handoverRaw].sort((a, b) => {
    const rank = (x: typeof a) => (x.completedAt ? 2 : x.priority === "URGENT" ? 0 : 1);
    return rank(a) - rank(b) || b.createdAt.getTime() - a.createdAt.getTime();
  });

  const staffCount = staffByRole.reduce((sum, r) => sum + r._count, 0);
  const staffSummary = staffByRole
    .map((r) => `${r._count} ${r.role.replace("_", " ").toLowerCase()}`)
    .join(" · ");

  const latestByResident = new Map<string, Date>();
  for (const plan of latestCarePlans) {
    if (!latestByResident.has(plan.residentId)) {
      latestByResident.set(plan.residentId, plan.createdAt);
    }
  }

  let needsReview = 0;
  for (const r of residents) {
    const latest = latestByResident.get(r.id);
    if (!latest || latest < reviewCutoff) needsReview++;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-600">Today at a glance across Westcliff Lodge.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<ResidentsIcon />}
          iconColor="bg-brand-50 text-brand-700"
          label="Residents"
          value={residentCount}
          href="/dashboard/residents"
        />
        <StatTile
          icon={<StaffIcon />}
          iconColor="bg-brand-50 text-brand-700"
          label="Staff"
          value={staffCount}
          sublabel={staffSummary || undefined}
          href="/dashboard/staff"
        />
        <StatTile
          icon={<NoteIcon />}
          iconColor="bg-amber-50 text-amber-700"
          label="Notes logged today"
          value={notesToday}
        />
        <StatTile
          icon={<CarePlanIcon />}
          iconColor="bg-coral-50 text-coral-700"
          label="Care plans"
          value={`${latestByResident.size}/${residentCount}`}
          sublabel={needsReview > 0 ? `${needsReview} need review (90+ days)` : "All reviewed recently"}
          attention={needsReview > 0}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<SparkleIcon />}
          iconColor="bg-brand-50 text-brand-700"
          label="Housekeeping"
          value={hkDone}
          sublabel={hkAttention > 0 ? `${hkAttention} need attention · done in last 24h` : "Done in last 24h · nothing outstanding"}
          attention={hkAttention > 0}
          href="/dashboard/housekeeping"
        />
        <StatTile
          icon={<ShieldIcon />}
          iconColor="bg-brand-50 text-brand-700"
          label="PPP library"
          value={pppFiles}
          sublabel={`files in ${pppFolders} folder${pppFolders === 1 ? "" : "s"}`}
          href="/dashboard/ppp"
        />
        <StatTile
          icon={<BuildingIcon />}
          iconColor="bg-amber-50 text-amber-700"
          label="Site checks"
          value={siteIssues === 0 ? "All clear" : siteIssues}
          sublabel={siteIssues === 0 ? "No overdue or failed checks" : `${siteOverdue} overdue · ${siteFailing} failing`}
          attention={siteIssues > 0}
          href="/dashboard/site"
        />
        <StatTile
          icon={<HandshakeIcon />}
          iconColor="bg-brand-50 text-brand-700"
          label="Services"
          value={servicesActive}
          sublabel={servicesDue > 0 ? `${servicesDue} renewal${servicesDue === 1 ? "" : "s"} due within 30 days` : "Third-party suppliers"}
          attention={servicesDue > 0}
          href="/dashboard/services"
        />
      </div>

      <HandoverBoard
        canManage={canManageHandover(session!.user.role)}
        items={handover.map((h) => ({
          id: h.id, kind: h.kind, priority: h.priority, title: h.title, body: h.body,
          createdAt: h.createdAt.toISOString(), createdBy: h.createdBy.name,
          completedAt: h.completedAt?.toISOString() ?? null, completedBy: h.completedBy?.name ?? null,
        }))}
      />
    </div>
  );
}
