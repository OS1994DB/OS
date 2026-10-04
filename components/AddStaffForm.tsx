"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const ROLES = ["CARER", "SENIOR_CARER", "MANAGER"];

export function AddStaffForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role"),
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create staff account.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Add staff account
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card sm:grid-cols-2"
    >
      <input name="name" required placeholder="Full name" className="field" />
      <input name="email" required type="email" placeholder="Email" className="field" />
      <input
        name="password"
        required
        type="text"
        minLength={8}
        placeholder="Temporary password (min 8 chars)"
        className="field"
      />
      <select name="role" className="field">
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.replace("_", " ")}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-coral-700 sm:col-span-2">{error}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Create account"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
