import Link from "next/link";
import { IncidentReview } from "@/components/IncidentReview";

const SEV_STYLE: Record<string, string> = {
  LOW: "bg-ink-700/10 text-ink-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-coral-50 text-coral-700",
};

export type IncidentRow = {
  id: string;
  type: string;
  severity: string;
  occurredAt: Date;
  location: string;
  description: string;
  actionTaken: string;
  status: string;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  reviewedByName: string | null;
  reportedByName: string;
  resident: { id: string; name: string } | null;
};

export function IncidentList({ incidents, canReview, showResident }: { incidents: IncidentRow[]; canReview: boolean; showResident: boolean }) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
        <p className="text-sm text-ink-600">No incidents.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {incidents.map((i) => (
        <li key={i.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SEV_STYLE[i.severity] ?? SEV_STYLE.LOW}`}>{i.severity.toLowerCase()}</span>
            <span className="text-sm font-medium capitalize text-ink-800">{i.type.replace("_", " ").toLowerCase()}</span>
            {showResident && (
              i.resident ? (
                <Link href={`/dashboard/residents/${i.resident.id}/incidents`} className="text-sm text-brand-700 hover:underline">{i.resident.name}</Link>
              ) : (
                <span className="text-sm text-ink-600">No resident</span>
              )
            )}
            <span className="ml-auto text-xs text-ink-600">{i.occurredAt.toLocaleString("en-GB")}{i.location && ` · ${i.location}`}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-ink-700">{i.description}</p>
          {i.actionTaken && <p className="mt-2 text-sm text-ink-600"><b>Action:</b> {i.actionTaken}</p>}
          <p className="mt-2 text-xs text-ink-600">Reported by {i.reportedByName}</p>
          {i.status === "REVIEWED" ? (
            <p className="mt-2 rounded-xl2 bg-brand-50 px-3 py-2 text-sm text-brand-700">
              Reviewed by {i.reviewedByName} · {i.reviewedAt?.toLocaleDateString("en-GB")}: {i.reviewNotes}
            </p>
          ) : canReview ? (
            <div className="mt-2"><IncidentReview id={i.id} /></div>
          ) : (
            <p className="mt-2 text-xs text-amber-700">Awaiting manager review</p>
          )}
        </li>
      ))}
    </ul>
  );
}
