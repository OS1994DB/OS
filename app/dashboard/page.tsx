import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/StatTile";
import { NoteBadge } from "@/components/NoteBadge";
import { ResidentsIcon, StaffIcon, NoteIcon, CarePlanIcon } from "@/components/icons";

const CARE_PLAN_REVIEW_DAYS = 90;

export default async function DashboardOverviewPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const reviewCutoff = new Date();
  reviewCutoff.setDate(reviewCutoff.getDate() - CARE_PLAN_REVIEW_DAYS);

  const [residentCount, staffByRole, notesToday, residents, latestCarePlans, recentNotes] =
    await Promise.all([
      prisma.resident.count(),
      prisma.user.groupBy({ by: ["role"], where: { active: true }, _count: true }),
      prisma.note.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.resident.findMany({ select: { id: true } }),
      prisma.carePlanVersion.findMany({
        orderBy: { version: "desc" },
        select: { residentId: true, createdAt: true },
      }),
      prisma.note.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { author: true, resident: true },
      }),
    ]);

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

      <div className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
        <div className="border-b border-ink-700/10 px-5 py-4">
          <h2 className="font-display font-semibold text-ink-800">Recent notes</h2>
        </div>
        {recentNotes.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-600">No notes logged yet.</p>
        ) : (
          <ul className="divide-y divide-ink-700/10">
            {recentNotes.map((note) => (
              <li key={note.id} className="px-5 py-4 transition-colors hover:bg-cream-50">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/residents/${note.residentId}`}
                      className="text-sm font-medium text-ink-800 hover:text-brand-700"
                    >
                      {note.resident.name}
                    </Link>
                    <NoteBadge category={note.category} />
                  </div>
                  <span className="text-xs text-ink-600">
                    {note.author.name} · {note.createdAt.toLocaleString("en-GB")}
                  </span>
                </div>
                <p className="text-sm text-ink-700">{note.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
