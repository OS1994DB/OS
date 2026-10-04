type Assessment = {
  id: string;
  title: string;
  riskLevel: string | null;
  findings: string;
  reviewDate: Date | null;
  createdAt: Date;
  completedBy: { name: string };
};

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-green-50 text-green-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-coral-50 text-coral-700",
};

export function AssessmentsList({ assessments, kind }: { assessments: Assessment[]; kind: "GENERAL" | "RISK" }) {
  if (assessments.length === 0) {
    return (
      <p className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 px-4 py-6 text-center text-sm text-ink-600">
        No {kind === "RISK" ? "risk assessments" : "assessments"} recorded yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {assessments.map((a) => (
        <li key={a.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink-800">{a.title}</p>
              {a.riskLevel && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_STYLES[a.riskLevel]}`}>
                  {a.riskLevel}
                </span>
              )}
            </div>
            <span className="text-xs text-ink-600">
              {a.completedBy.name} · {a.createdAt.toLocaleDateString("en-GB")}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-ink-700">{a.findings}</p>
          {a.reviewDate && (
            <p className="mt-2 text-xs text-ink-600">
              Next review: {a.reviewDate.toLocaleDateString("en-GB")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
