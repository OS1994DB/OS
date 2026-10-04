"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];

export function AddAssessmentForm({ residentId, kind }: { residentId: string; kind: "GENERAL" | "RISK" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [riskLevel, setRiskLevel] = useState("MEDIUM");
  const [findings, setFindings] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/residents/${residentId}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        title,
        riskLevel: kind === "RISK" ? riskLevel : undefined,
        findings,
        reviewDate: reviewDate || undefined,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Could not save assessment.");
      return;
    }

    setTitle("");
    setFindings("");
    setReviewDate("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-sm">
        + Add {kind === "RISK" ? "risk assessment" : "assessment"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder={kind === "RISK" ? "e.g. Falls risk assessment" : "e.g. Nutritional assessment (MUST)"}
        className="field mb-3"
      />
      {kind === "RISK" && (
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm font-medium text-ink-700">Risk level</label>
          <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} className="field w-auto py-1.5">
            {RISK_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      )}
      <textarea
        value={findings}
        onChange={(e) => setFindings(e.target.value)}
        required
        rows={4}
        placeholder="Findings / mitigations..."
        className="field mb-3"
      />
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-ink-700">Next review date (optional)</label>
        <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="field" />
      </div>
      {error && <p className="mb-2 text-sm text-coral-700">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
