"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const CATEGORIES = ["GENERAL", "CARE", "HEALTH", "INCIDENT", "RISK"];

export function AddNoteForm({ residentId }: { residentId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/residents/${residentId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, category }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Could not save note.");
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm font-medium text-ink-700">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field w-auto py-1.5">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note..."
        rows={3}
        className="field mb-3"
      />
      {error && <p className="mb-2 text-sm text-coral-700">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Saving..." : "Add note"}
      </button>
    </form>
  );
}
