"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SITE_CHECK_TYPES } from "@/lib/siteChecks";

export function SiteCheckForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/site-checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: f.get("type"), area: f.get("area"), result: f.get("result"), notes: f.get("notes") }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="btn-primary">+ Log a check</button>;
  return (
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card sm:grid-cols-2">
      <select name="type" className="field">
        {SITE_CHECK_TYPES.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
      </select>
      <input name="area" placeholder="Area (e.g. Ground floor corridor)" className="field" />
      <select name="result" className="field">
        <option value="PASS">Pass</option>
        <option value="FAIL">Fail / issue found</option>
      </select>
      <input name="notes" placeholder="Notes (required if failed)" className="field" />
      {error && <p className="text-sm text-coral-700 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-primary">Save</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
