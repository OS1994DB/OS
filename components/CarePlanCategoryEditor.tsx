"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConsentLog } from "@/components/ConsentLog";

export type ReviewStatus = "none" | "ok" | "due_soon" | "overdue";

type PlanFields = {
  identifiedRisk: string;
  residentPerspective: string;
  careSupport: string;
  careDirective: string;
  reviewSummary: string;
};

type LatestPlan = (PlanFields & { version: number; createdAt: string }) | null;

type HistoryEntry = PlanFields & { version: number; createdAt: string; createdBy: { name: string } };

type ReviewEntry = {
  id: string;
  notes: string;
  createdAt: string;
  reviewedBy: { name: string };
};

type ConsentEntry = {
  id: string;
  type: "BEST_INTEREST" | "SOUGHT";
  dateLogged: string;
  reviewDate: string | null;
  supportDecision: string;
};

const REVIEW_STATUS_STYLES: Record<ReviewStatus, { text: string; border: string }> = {
  none: { text: "text-ink-600", border: "border-ink-700/20" },
  ok: { text: "text-green-700", border: "border-green-500" },
  due_soon: { text: "text-amber-600", border: "border-amber-500" },
  overdue: { text: "text-coral-700", border: "border-coral-600" },
};

const REVIEW_BANNER_STYLES: Record<ReviewStatus, string> = {
  none: "",
  ok: "border-green-500/30 bg-green-50 text-green-700",
  due_soon: "border-amber-500/40 bg-amber-50 text-amber-700",
  overdue: "border-coral-500/40 bg-coral-50 text-coral-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB");
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="field" />
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-600">{label}</p>
      <p className="whitespace-pre-wrap rounded-xl2 bg-amber-50 p-3 text-sm leading-relaxed text-ink-800">
        {value.trim() ? value : <span className="text-ink-600">Not recorded.</span>}
      </p>
    </div>
  );
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  return (
    <details className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-3 text-sm">
      <summary className="cursor-pointer font-medium text-ink-700">
        v{entry.version} · {formatDate(entry.createdAt)} · {entry.createdBy.name}
      </summary>
      <div className="mt-3 space-y-3">
        <ReadField label="Identified risk" value={entry.identifiedRisk} />
        <ReadField label="The resident's perspective" value={entry.residentPerspective} />
        <ReadField label="Identified care and support" value={entry.careSupport} />
        <ReadField label="Care directive" value={entry.careDirective} />
        <ReadField label="Review summary" value={entry.reviewSummary} />
      </div>
    </details>
  );
}

export function CarePlanCategoryEditor({
  residentId,
  category,
  label,
  canEdit,
  latest,
  history,
  consentEntries,
  reviews,
  reviewDueDate,
  reviewStatus,
}: {
  residentId: string;
  category: string;
  label: string;
  canEdit: boolean;
  latest: LatestPlan;
  history: HistoryEntry[];
  consentEntries: ConsentEntry[];
  reviews: ReviewEntry[];
  reviewDueDate: string | null;
  reviewStatus: ReviewStatus;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"plan" | "review">("plan");

  const [editingPlan, setEditingPlan] = useState(false);
  const [risk, setRisk] = useState(latest?.identifiedRisk ?? "");
  const [perspective, setPerspective] = useState(latest?.residentPerspective ?? "");
  const [support, setSupport] = useState(latest?.careSupport ?? "");
  const [directive, setDirective] = useState(latest?.careDirective ?? "");
  const [reviewSummary, setReviewSummary] = useState(latest?.reviewSummary ?? "");
  const [savingPlan, setSavingPlan] = useState(false);
  const [planError, setPlanError] = useState("");

  async function savePlan() {
    setSavingPlan(true);
    setPlanError("");

    const res = await fetch(`/api/residents/${residentId}/care-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        identifiedRisk: risk,
        residentPerspective: perspective,
        careSupport: support,
        careDirective: directive,
        reviewSummary,
      }),
    });

    setSavingPlan(false);

    if (!res.ok) {
      setPlanError("Could not save.");
      return;
    }

    setEditingPlan(false);
    router.refresh();
  }

  function cancelPlanEdit() {
    setEditingPlan(false);
    setRisk(latest?.identifiedRisk ?? "");
    setPerspective(latest?.residentPerspective ?? "");
    setSupport(latest?.careSupport ?? "");
    setDirective(latest?.careDirective ?? "");
    setReviewSummary(latest?.reviewSummary ?? "");
  }

  const [addingReview, setAddingReview] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  async function saveReview() {
    if (!reviewNotes.trim()) return;
    setSavingReview(true);
    setReviewError("");

    const res = await fetch(`/api/residents/${residentId}/care-plan/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, notes: reviewNotes }),
    });

    setSavingReview(false);

    if (!res.ok) {
      setReviewError("Could not save review.");
      return;
    }

    setReviewNotes("");
    setAddingReview(false);
    router.refresh();
  }

  const reviewStyle = REVIEW_STATUS_STYLES[reviewStatus];

  return (
    <div>
      <div className="mb-5 flex gap-6 border-b border-ink-700/10">
        <button
          onClick={() => setTab("plan")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            tab === "plan" ? "border-brand-500 text-brand-700" : "border-transparent text-ink-600 hover:text-ink-800"
          }`}
        >
          Plan
        </button>
        <button
          onClick={() => setTab("review")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${reviewStyle.text} ${
            tab === "review" ? reviewStyle.border : "border-transparent"
          }`}
        >
          Review
        </button>
      </div>

      {tab === "plan" && (
        <div className="space-y-4">
          <section className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display font-semibold text-ink-800">
                Care plan
                {latest && <span className="ml-1.5 font-normal text-ink-600">· v{latest.version}</span>}
              </h3>
              {canEdit && !editingPlan && (
                <button
                  onClick={() => setEditingPlan(true)}
                  className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                >
                  {latest ? "Edit (new version)" : "+ Add entry"}
                </button>
              )}
            </div>

            {editingPlan ? (
              <div className="space-y-4">
                <Field label="Identified risk" value={risk} onChange={setRisk} />
                <Field label="The resident's perspective" value={perspective} onChange={setPerspective} />
                <Field label="Identified care and support" value={support} onChange={setSupport} />
                <Field label="Care directive" value={directive} onChange={setDirective} />
                <Field label="Review summary" value={reviewSummary} onChange={setReviewSummary} />
                {planError && <p className="text-sm text-coral-700">{planError}</p>}
                <div className="flex gap-2">
                  <button onClick={savePlan} disabled={savingPlan} className="btn-primary">
                    {savingPlan ? "Saving..." : "Save new version"}
                  </button>
                  <button onClick={cancelPlanEdit} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : latest ? (
              <div className="space-y-4">
                <ReadField label="Identified risk" value={latest.identifiedRisk} />
                <ReadField label="The resident's perspective" value={latest.residentPerspective} />
                <ReadField label="Identified care and support" value={latest.careSupport} />
                <ReadField label="Care directive" value={latest.careDirective} />
                <ReadField label="Review summary" value={latest.reviewSummary} />
              </div>
            ) : (
              <p className="text-sm text-ink-600">No care plan recorded yet for {label}.</p>
            )}
          </section>

          <ConsentLog residentId={residentId} category={category} canEdit={canEdit} entries={consentEntries} />

          {history.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
                Version history ({history.length})
              </p>
              <div className="space-y-2">
                {history.map((entry) => (
                  <HistoryItem key={entry.version} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "review" && (
        <section>
          {reviewDueDate && (
            <div className={`mb-4 rounded-xl2 border p-3 text-sm ${REVIEW_BANNER_STYLES[reviewStatus]}`}>
              {reviewStatus === "overdue" && `Review overdue — was due ${formatDate(reviewDueDate)}.`}
              {reviewStatus === "due_soon" && `Review due soon — by ${formatDate(reviewDueDate)}.`}
              {reviewStatus === "ok" && `Next review due ${formatDate(reviewDueDate)}.`}
            </div>
          )}

          {canEdit &&
            (addingReview ? (
              <div className="mb-4 rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
                <label className="mb-1 block text-sm font-medium text-ink-700">Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={5}
                  placeholder="What was checked, and the outcome..."
                  className="field mb-2"
                />
                {reviewError && <p className="mb-2 text-sm text-coral-700">{reviewError}</p>}
                <div className="flex gap-2">
                  <button onClick={saveReview} disabled={savingReview} className="btn-primary">
                    {savingReview ? "Saving..." : "Save review"}
                  </button>
                  <button
                    onClick={() => {
                      setAddingReview(false);
                      setReviewNotes("");
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingReview(true)} className="btn-secondary mb-4 text-sm">
                + Add review
              </button>
            ))}

          {reviews.length === 0 ? (
            <p className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 px-4 py-6 text-center text-sm text-ink-600">
              No reviews recorded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs text-ink-600">
                      {r.reviewedBy.name} · {new Date(r.createdAt).toLocaleString("en-GB")}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-ink-700">{r.notes}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
