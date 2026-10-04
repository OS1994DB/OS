"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IncidentReview({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setError("");
    const res = await fetch(`/api/incidents/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed.");
      return;
    }
    router.refresh();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="btn-secondary">Mark reviewed</button>;
  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Review notes / lessons learned" className="field flex-1" />
      <button onClick={save} className="btn-primary">Save review</button>
      {error && <p className="text-sm text-coral-700">{error}</p>}
    </div>
  );
}
