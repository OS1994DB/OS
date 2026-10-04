import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReviewIncidents } from "@/lib/permissions";
import { loadIncidents } from "@/lib/incidentQueries";
import { IncidentList } from "@/components/IncidentList";

// Managers' overview of every resident's incidents (reached from Admin).
// Staff report and read incidents inside each resident's own tabs.
export default async function IncidentsOverviewPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!canReviewIncidents(session!.user.role)) redirect("/dashboard");

  const where = status === "open" ? { status: "OPEN" } : status === "reviewed" ? { status: "REVIEWED" } : {};
  const incidents = await loadIncidents(where);
  const tabs = [["", "All"], ["open", "Open"], ["reviewed", "Reviewed"]];

  return (
    <div>
      <Link href="/dashboard/admin" className="mb-3 inline-block text-sm font-medium text-ink-600 hover:text-brand-600">← Admin</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Incidents overview</h1>
      <p className="mb-6 mt-1 text-sm text-ink-600">All residents · incidents are reported inside each resident&apos;s tabs</p>
      <div className="mb-4 flex gap-2">
        {tabs.map(([v, l]) => (
          <Link key={v} href={v ? `/dashboard/incidents?status=${v}` : "/dashboard/incidents"}
            className={`rounded-xl2 px-3 py-1.5 text-sm font-medium ${(status ?? "") === v ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-white/5"}`}>
            {l}
          </Link>
        ))}
      </div>
      <IncidentList incidents={incidents} canReview showResident />
    </div>
  );
}
