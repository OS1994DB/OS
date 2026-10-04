import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canReviewIncidents } from "@/lib/permissions";
import { IncidentReview } from "@/components/IncidentReview";

const SEV_STYLE: Record<string, string> = {
  LOW: "bg-ink-700/10 text-ink-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-coral-50 text-coral-700",
};

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const session = await getServerSession(authOptions);
  const canReview = canReviewIncidents(session!.user.role);
  const where = status === "open" ? { status: "OPEN" } : status === "reviewed" ? { status: "REVIEWED" } : {};

  const incidents = await prisma.incident.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { resident: true, reportedBy: true, reviewedBy: true },
  });

  const tabs = [["", "All"], ["open", "Open"], ["reviewed", "Reviewed"]];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Incidents</h1>
          <p className="mt-1 text-sm text-ink-600">Falls, near misses, accidents and other reports</p>
        </div>
        <Link href="/dashboard/incidents/new" className="btn-primary">+ Report incident</Link>
      </div>

      <div className="mb-4 flex gap-2">
        {tabs.map(([v, l]) => (
          <Link key={v} href={v ? `/dashboard/incidents?status=${v}` : "/dashboard/incidents"}
            className={`rounded-xl2 px-3 py-1.5 text-sm font-medium ${(status ?? "") === v ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-white/5"}`}>
            {l}
          </Link>
        ))}
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
          <p className="text-sm text-ink-600">No incidents.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {incidents.map((i) => (
            <li key={i.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SEV_STYLE[i.severity] ?? SEV_STYLE.LOW}`}>{i.severity.toLowerCase()}</span>
                <span className="text-sm font-medium capitalize text-ink-800">{i.type.replace("_", " ").toLowerCase()}</span>
                {i.resident && (
                  <Link href={`/dashboard/residents/${i.resident.id}`} className="text-sm text-brand-700 hover:underline">{i.resident.name}</Link>
                )}
                <span className="ml-auto text-xs text-ink-600">{i.occurredAt.toLocaleString("en-GB")}{i.location && ` · ${i.location}`}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-ink-700">{i.description}</p>
              {i.actionTaken && <p className="mt-2 text-sm text-ink-600"><b>Action:</b> {i.actionTaken}</p>}
              <p className="mt-2 text-xs text-ink-600">Reported by {i.reportedBy.name}</p>
              {i.status === "REVIEWED" ? (
                <p className="mt-2 rounded-xl2 bg-brand-50 px-3 py-2 text-sm text-brand-700">
                  Reviewed by {i.reviewedBy?.name} · {i.reviewedAt?.toLocaleDateString("en-GB")}: {i.reviewNotes}
                </p>
              ) : canReview ? (
                <div className="mt-2"><IncidentReview id={i.id} /></div>
              ) : (
                <p className="mt-2 text-xs text-amber-700">Awaiting manager review</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
