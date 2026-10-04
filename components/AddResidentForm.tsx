"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AddResidentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/residents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        dateOfBirth: form.get("dateOfBirth"),
        roomNumber: form.get("roomNumber"),
        keyContactName: form.get("keyContactName"),
        keyContactPhone: form.get("keyContactPhone"),
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Could not add resident. Check the fields and try again.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Add resident
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card sm:grid-cols-2"
    >
      <input name="name" required placeholder="Full name" className="field" />
      <input name="dateOfBirth" required type="date" className="field" />
      <input name="roomNumber" required placeholder="Room number" className="field" />
      <input name="keyContactName" required placeholder="Key contact name" className="field" />
      <input name="keyContactPhone" required placeholder="Key contact phone" className="field sm:col-span-2" />

      {error && <p className="text-sm text-coral-700 sm:col-span-2">{error}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Save resident"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
