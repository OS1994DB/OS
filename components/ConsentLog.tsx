"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ConsentType = "BEST_INTEREST" | "SOUGHT";

type ConsentEntryData = {
  id: string;
  type: ConsentType;
  dateLogged: string;
  reviewDate: string | null;
  supportDecision: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB");
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function TypeBadge({ type }: { type: ConsentType }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        type === "BEST_INTEREST" ? "bg-orange-500 text-white" : "bg-cream-50 text-ink-700 ring-1 ring-ink-700/15"
      }`}
    >
      {type === "BEST_INTEREST" ? "Best Interest" : "Sought"}
    </span>
  );
}

export function ConsentLog({
  residentId,
  category,
  canEdit,
  entries,
}: {
  residentId: string;
  category: string;
  canEdit: boolean;
  entries: ConsentEntryData[];
}) {
  const router = useRouter();
  const [sortAsc, setSortAsc] = useState(false);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<ConsentType>("BEST_INTEREST");
  const [dateLogged, setDateLogged] = useState(todayInputValue());
  const [reviewDate, setReviewDate] = useState("");
  const [supportDecision, setSupportDecision] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const diff = new Date(a.dateLogged).getTime() - new Date(b.dateLogged).getTime();
      return sortAsc ? diff : -diff;
    });
  }, [entries, sortAsc]);

  async function save() {
    if (!supportDecision.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/residents/${residentId}/care-plan/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, type, dateLogged, reviewDate: reviewDate || undefined, supportDecision }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Could not save.");
      return;
    }

    setAdding(false);
    setSupportDecision("");
    setReviewDate("");
    setDateLogged(todayInputValue());
    router.refresh();
  }

  return (
    <section className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-ink-700/10 px-4 py-3">
        <h3 className="font-display font-semibold text-ink-800">Consent</h3>
      </div>

      <div className="p-4">
        {canEdit && (
          <div className="mb-4 flex gap-1 rounded-full bg-cream-50 p-1 ring-1 ring-ink-700/10 w-fit">
            <button
              onClick={() => setType("BEST_INTEREST")}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                type === "BEST_INTEREST" ? "bg-orange-500 text-white" : "text-ink-700 hover:bg-white/50"
              }`}
            >
              Best Interest
            </button>
            <button
              onClick={() => setType("SOUGHT")}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                type === "SOUGHT" ? "bg-orange-500 text-white" : "text-ink-700 hover:bg-white/50"
              }`}
            >
              Sought
            </button>
          </div>
        )}

        {canEdit &&
          (adding ? (
            <div className="mb-4 space-y-3 rounded-xl2 border border-ink-700/10 bg-cream-50 p-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700">Date logged</label>
                  <input
                    type="date"
                    value={dateLogged}
                    onChange={(e) => setDateLogged(e.target.value)}
                    className="field w-auto"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700">Review date (optional)</label>
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => setReviewDate(e.target.value)}
                    className="field w-auto"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Support decision</label>
                <textarea
                  value={supportDecision}
                  onChange={(e) => setSupportDecision(e.target.value)}
                  rows={3}
                  className="field"
                />
              </div>
              {error && <p className="text-sm text-coral-700">{error}</p>}
              <div className="flex gap-2">
                <button onClick={save} disabled={submitting} className="btn-primary">
                  {submitting ? "Saving..." : "Save entry"}
                </button>
                <button onClick={() => setAdding(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-lg font-bold leading-none text-white transition-colors hover:bg-green-600"
              aria-label="Add consent entry"
            >
              +
            </button>
          ))}

        {sorted.length === 0 ? (
          <p className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-50 px-4 py-6 text-center text-sm text-ink-600">
            No consent entries recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-700/10 text-xs uppercase tracking-wide text-ink-600">
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">
                    <button onClick={() => setSortAsc((s) => !s)} className="flex items-center gap-1 hover:text-ink-800">
                      Date logged
                      <span>{sortAsc ? "↑" : "↓"}</span>
                    </button>
                  </th>
                  <th className="py-2 pr-4 font-semibold">Review date</th>
                  <th className="py-2 font-semibold">Support decision</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.id} className="border-b border-ink-700/5 align-top last:border-0">
                    <td className="py-2.5 pr-4">
                      <TypeBadge type={e.type} />
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-ink-700">{formatDate(e.dateLogged)}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-ink-700">
                      {e.reviewDate ? formatDate(e.reviewDate) : "—"}
                    </td>
                    <td className="py-2.5 text-ink-700">{e.supportDecision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
