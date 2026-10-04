"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type MedRow = {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  instructions: string;
  prn: boolean;
  last: { outcome: string; at: string; by: string } | null;
};

const OUTCOME_LABEL: Record<string, string> = {
  GIVEN: "Given",
  REFUSED: "Refused",
  OMITTED: "Omitted",
  NOT_AVAILABLE: "Not available",
};

export function MedicationChart({ residentId, meds, canManage }: { residentId: string; meds: MedRow[]; canManage: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function call(url: string, method: string, body: unknown) {
    setError("");
    setBusy(true);
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Request failed.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function record(e: FormEvent<HTMLFormElement>, medId: string) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (await call(`/api/residents/${residentId}/medications/${medId}/administrations`, "POST", { outcome: f.get("outcome"), notes: f.get("notes") })) {
      setRecording(null);
    }
  }

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (await call(`/api/residents/${residentId}/medications`, "POST", {
      name: f.get("name"), dose: f.get("dose"), route: f.get("route"), frequency: f.get("frequency"),
      instructions: f.get("instructions"), prn: f.get("prn") === "on",
    })) setAdding(false);
  }

  async function stop(medId: string) {
    const reason = window.prompt("Reason for stopping this medication:");
    if (reason) await call(`/api/residents/${residentId}/medications/${medId}`, "PATCH", { reason });
  }

  return (
    <div>
      {canManage && !adding && (
        <button onClick={() => setAdding(true)} className="btn-primary mb-4">+ Add medication</button>
      )}
      {adding && (
        <form onSubmit={add} className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card sm:grid-cols-2">
          <input name="name" required placeholder="Medication name" className="field" />
          <input name="dose" required placeholder="Dose (e.g. 500mg)" className="field" />
          <select name="route" className="field">
            {["ORAL", "TOPICAL", "INHALED", "INJECTION", "OTHER"].map((r) => <option key={r} value={r}>{r.toLowerCase()}</option>)}
          </select>
          <input name="frequency" required placeholder="Frequency (e.g. Twice daily 08:00, 20:00)" className="field" />
          <input name="instructions" placeholder="Instructions (optional)" className="field sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" name="prn" /> PRN (as required)</label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={busy} className="btn-primary">Save</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}
      {error && <p className="mb-3 rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}

      {meds.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
          <p className="text-sm text-ink-600">No active medication.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {meds.map((m) => (
            <li key={m.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink-800">
                    {m.name} <span className="font-normal text-ink-600">· {m.dose} · {m.route.toLowerCase()}</span>
                    {m.prn && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">PRN</span>}
                  </p>
                  <p className="text-sm text-ink-600">{m.frequency}</p>
                  {m.instructions && <p className="mt-1 text-sm text-ink-700">{m.instructions}</p>}
                  <p className="mt-1 text-xs text-ink-600">
                    {m.last ? `Last: ${OUTCOME_LABEL[m.last.outcome] ?? m.last.outcome} · ${new Date(m.last.at).toLocaleString("en-GB")} · ${m.last.by}` : "Not yet recorded"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRecording(recording === m.id ? null : m.id)} className="btn-primary">Record dose</button>
                  {canManage && <button onClick={() => stop(m.id)} className="btn-secondary">Stop</button>}
                </div>
              </div>
              {recording === m.id && (
                <form onSubmit={(e) => record(e, m.id)} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <select name="outcome" className="field sm:w-48">
                    {Object.entries(OUTCOME_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <input name="notes" placeholder="Note (required unless given)" className="field flex-1" />
                  <button type="submit" disabled={busy} className="btn-primary">Save</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
