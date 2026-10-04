"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { THIRD_PARTY_CATEGORIES } from "@/lib/thirdParties";

export function AddThirdPartyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/third-parties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="btn-primary">+ Add service</button>;
  return (
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card sm:grid-cols-2">
      <input name="name" required placeholder="Organisation name" className="field" />
      <select name="category" className="field">
        {THIRD_PARTY_CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
      </select>
      <input name="contactName" placeholder="Contact person" className="field" />
      <input name="phone" placeholder="Phone" className="field" />
      <input name="email" type="email" placeholder="Email" className="field" />
      <label className="flex items-center gap-2 text-sm text-ink-600">
        Contract / renewal date
        <input name="renewalDate" type="date" className="field" />
      </label>
      <input name="notes" placeholder="Notes (account no., out-of-hours number...)" className="field sm:col-span-2" />
      {error && <p className="text-sm text-coral-700 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-primary">Save</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  async function toggle() {
    const res = await fetch(`/api/third-parties/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    if (res.ok) router.refresh();
  }
  return <button onClick={toggle} className="btn-secondary">{active ? "Mark inactive" : "Reactivate"}</button>;
}
