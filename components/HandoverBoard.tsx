"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type HandoverRow = {
  id: string;
  kind: string;
  priority: string;
  title: string;
  body: string;
  createdAt: string;
  createdBy: string;
  completedAt: string | null;
  completedBy: string | null;
};

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });

export function HandoverBoard({ items, canManage }: { items: HandoverRow[]; canManage: boolean }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(url: string, method: string, body: unknown) {
    setError("");
    setBusy(true);
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Something went wrong.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (await send("/api/handover", "POST", { ...f, priority: f.urgent ? "URGENT" : "NORMAL" })) setAdding(false);
  }

  async function remove(id: string) {
    if (window.confirm("Remove this from the handover board?")) await send(`/api/handover/${id}`, "PATCH", { action: "archive" });
  }

  return (
    <div className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-ink-700/10 px-5 py-4">
        <div>
          <h2 className="font-display font-semibold text-ink-800">Handover / Important information</h2>
          <p className="text-xs text-ink-600">Notices and tasks for the team</p>
        </div>
        {canManage && !adding && <button onClick={() => setAdding(true)} className="btn-primary">+ Add</button>}
      </div>

      {adding && (
        <form onSubmit={add} className="grid grid-cols-1 gap-3 border-b border-ink-700/10 bg-cream-50 p-5 sm:grid-cols-2">
          <select name="kind" className="field" defaultValue="NOTICE">
            <option value="NOTICE">Important notice</option>
            <option value="TASK">Task to complete</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" name="urgent" /> Mark as urgent
          </label>
          <input name="title" required maxLength={200} placeholder="Title (e.g. Room 12 on fluid chart)" className="field sm:col-span-2" />
          <textarea name="body" rows={2} maxLength={2000} placeholder="Details (optional)" className="field sm:col-span-2" />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={busy} className="btn-primary">Post</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}
      {error && <p className="bg-coral-50 px-5 py-2 text-sm text-coral-700">{error}</p>}

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-600">Nothing to hand over right now.</p>
      ) : (
        <ul className="divide-y divide-ink-700/10">
          {items.map((i) => {
            const done = !!i.completedAt;
            return (
              <li key={i.id} className={`flex items-start gap-3 px-5 py-4 ${i.priority === "URGENT" && !done ? "bg-coral-50" : ""}`}>
                {i.kind === "TASK" ? (
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={busy}
                    onChange={() => send(`/api/handover/${i.id}`, "PATCH", { action: done ? "reopen" : "complete" })}
                    className="mt-1 h-5 w-5 shrink-0 accent-brand-500"
                    aria-label={done ? "Mark as not done" : "Mark as done"}
                  />
                ) : (
                  <span className="mt-0.5 shrink-0 text-lg" aria-hidden>📌</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${done ? "text-ink-600 line-through" : "text-ink-800"}`}>
                    {i.priority === "URGENT" && !done && <span className="mr-2 rounded-full bg-coral-500 px-2 py-0.5 text-xs font-semibold text-white">URGENT</span>}
                    {i.title}
                  </p>
                  {i.body && <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink-700">{i.body}</p>}
                  <p className="mt-1 text-xs text-ink-600">
                    {i.kind === "TASK" ? "Task" : "Notice"} from {i.createdBy} · {fmt(i.createdAt)}
                    {done && ` · done by ${i.completedBy} · ${fmt(i.completedAt!)}`}
                  </p>
                </div>
                {canManage && <button onClick={() => remove(i.id)} disabled={busy} className="btn-secondary shrink-0">Remove</button>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
