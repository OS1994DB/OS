"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PencilIcon } from "@/components/icons";

export function EditableField({
  residentId,
  field,
  label,
  value,
  display,
  type = "text",
  canEdit,
}: {
  residentId: string;
  field: string;
  label: string;
  value: string;
  display: string;
  type?: "text" | "date";
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    setSubmitting(true);
    const res = await fetch(`/api/residents/${residentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value: draft }),
    });
    setSubmitting(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-ink-800">{label}:</span>
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          className="field w-auto py-1 text-sm"
        />
        <button onClick={save} disabled={submitting} className="btn-primary px-2 py-1 text-xs">
          Save
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setDraft(value);
          }}
          className="btn-secondary px-2 py-1 text-xs"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-ink-700">
      <span className="font-medium text-ink-800">{label}:</span> {display}
      {canEdit && (
        <button
          onClick={() => setEditing(true)}
          aria-label={`Edit ${label}`}
          className="text-ink-600 hover:text-brand-700"
        >
          <PencilIcon />
        </button>
      )}
    </div>
  );
}
