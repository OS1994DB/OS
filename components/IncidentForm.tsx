"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const TYPES = ["FALL", "NEAR_MISS", "ACCIDENT", "BEHAVIOUR", "MEDICATION", "SAFEGUARDING", "OTHER"];

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function IncidentForm({ residentId }: { residentId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residentId, type: f.get("type"), severity: f.get("severity"),
        occurredAt: new Date(String(f.get("occurredAt"))).toISOString(),
        location: f.get("location"), description: f.get("description"), actionTaken: f.get("actionTaken"),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save report.");
      return;
    }
    router.push(`/dashboard/residents/${residentId}/incidents`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card sm:grid-cols-2">
      <input name="occurredAt" type="datetime-local" required defaultValue={nowLocal()} className="field" />
      <select name="type" className="field">
        {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ").toLowerCase()}</option>)}
      </select>
      <select name="severity" defaultValue="LOW" className="field">
        <option value="LOW">Low severity</option>
        <option value="MEDIUM">Medium severity</option>
        <option value="HIGH">High severity</option>
      </select>
      <input name="location" placeholder="Location (e.g. Lounge)" className="field sm:col-span-2" />
      <textarea name="description" required rows={4} placeholder="What happened?" className="field sm:col-span-2" />
      <textarea name="actionTaken" rows={3} placeholder="Action taken" className="field sm:col-span-2" />
      {error && <p className="text-sm text-coral-700 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving..." : "Submit report"}</button>
      </div>
    </form>
  );
}
