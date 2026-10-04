"use client";

import { useState } from "react";
import {
  ResidentsIcon,
  AlertTriangleIcon,
  PillIcon,
  MedicalCrossIcon,
  AssessmentIcon,
  HeartIcon,
} from "@/components/icons";

type Detail = {
  id: string;
  section: string;
  content: string;
  createdAt: string;
  createdBy: { name: string };
};

const SECTIONS = [
  { value: "INFO", label: "Resident info", icon: ResidentsIcon },
  { value: "ALLERGY", label: "Allergies", icon: AlertTriangleIcon },
  { value: "MEDICATION", label: "Medication", icon: PillIcon },
  { value: "GP", label: "GP", icon: MedicalCrossIcon },
  { value: "CONDITION", label: "Medical condition", icon: AssessmentIcon },
  { value: "ABOUT_ME", label: "This is me", icon: HeartIcon },
];

export function ResidentInfoBar({ residentId, initialDetails }: { residentId: string; initialDetails: Detail[] }) {
  const [details, setDetails] = useState(initialDetails);
  const [section, setSection] = useState("INFO");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const visible = details.filter((d) => d.section === section);
  const activeMeta = SECTIONS.find((s) => s.value === section)!;

  async function handleAdd() {
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/residents/${residentId}/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, content }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Could not save.");
      return;
    }

    const created = await res.json();
    setDetails((prev) => [{ ...created, createdBy: { name: "You" } }, ...prev]);
    setContent("");
  }

  async function handleRemove(detailId: string) {
    setDetails((prev) => prev.filter((d) => d.id !== detailId));
    await fetch(`/api/residents/${residentId}/details/${detailId}`, { method: "DELETE" });
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
      <nav className="flex gap-5 overflow-x-auto border-b border-ink-700/10 px-4">
        {SECTIONS.map((s) => {
          const active = s.value === section;
          return (
            <button
              key={s.value}
              onClick={() => setSection(s.value)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors ${
                active ? "border-brand-500 text-brand-700" : "border-transparent text-ink-600 hover:text-ink-800"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        {visible.length > 0 ? (
          <ul className="mb-3 flex flex-wrap gap-2">
            {visible.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-2 rounded-full border border-ink-700/10 bg-cream-50 py-1 pl-3 pr-1.5 text-sm text-ink-800"
              >
                {d.content}
                <button
                  onClick={() => handleRemove(d.id)}
                  aria-label={`Remove ${d.content}`}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-ink-600 hover:bg-coral-50 hover:text-coral-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-ink-600">No entries yet for {activeMeta.label}.</p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={`Add to ${activeMeta.label}...`}
            className="field flex-1"
          />
          <button onClick={handleAdd} disabled={submitting} className="btn-primary whitespace-nowrap">
            {submitting ? "Adding..." : "+ Add"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-coral-700">{error}</p>}
      </div>
    </div>
  );
}
