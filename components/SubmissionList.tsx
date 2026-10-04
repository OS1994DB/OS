import { parseAnswers } from "@/lib/templates";

export type SubmissionRow = {
  id: string;
  templateName: string;
  templateVersion: number;
  location: string;
  residentName?: string | null;
  answers: string;
  result: string;
  notes: string;
  completedBy: string;
  createdAt: Date;
};

const LABEL: Record<string, string> = { PASS: "Pass", FAIL: "Fail", NA: "N/A", YES: "Yes", NO: "No", LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export function SubmissionList({ rows, title = "Completed templates", empty = "Nothing completed yet." }: { rows: SubmissionRow[]; title?: string; empty?: string }) {
  return (
    <div className="mt-8">
      <h2 className="mb-2 font-display text-base font-semibold text-ink-800">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-600">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const answers = parseAnswers(r.answers);
            const flagged = answers.filter((a) => a.flagged);
            return (
              <li key={r.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink-800">{r.templateName}</span>
                  <span className="text-xs text-ink-600">v{r.templateVersion}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.result === "PASS" ? "bg-brand-50 text-brand-700" : "bg-coral-50 text-coral-700"}`}>
                    {r.result === "PASS" ? "Pass" : `Action needed (${flagged.length})`}
                  </span>
                  <span className="ml-auto text-xs text-ink-600">
                    {r.createdAt.toLocaleString("en-GB")} · {r.completedBy}
                  </span>
                </div>
                {(r.location || r.residentName) && (
                  <p className="mt-1 text-sm text-ink-600">{[r.residentName, r.location].filter(Boolean).join(" · ")}</p>
                )}
                {r.notes && <p className="mt-1 text-sm text-ink-700">{r.notes}</p>}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-brand-700">View answers</summary>
                  <ul className="mt-2 space-y-1 text-sm">
                    {answers.map((a) => (
                      <li key={a.id} className={a.flagged ? "text-coral-700" : "text-ink-700"}>
                        {a.text}: <b>{LABEL[a.value] ?? a.value}</b>{a.note && ` — ${a.note}`}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
