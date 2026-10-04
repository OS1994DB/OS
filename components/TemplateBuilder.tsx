"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ITEM_TYPES, TEMPLATE_AREAS, type ItemType } from "@/lib/templates";

type Q = { id: string; text: string; type: ItemType; required: boolean };
export type TemplateDraft = { id?: string; name: string; description: string; areas: string[]; items: Q[] };

let counter = 0;
const newId = () => `q${Date.now().toString(36)}${counter++}`;

export function TemplateBuilder({ initial }: { initial?: TemplateDraft }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [areas, setAreas] = useState<string[]>(initial?.areas ?? []);
  const [items, setItems] = useState<Q[]>(initial?.items ?? [{ id: newId(), text: "", type: "PASS_FAIL", required: true }]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (i: number, patch: Partial<Q>) => setItems((cur) => cur.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const move = (i: number, dir: -1 | 1) =>
    setItems((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(initial?.id ? `/api/admin/templates/${initial.id}` : "/api/admin/templates", {
      method: initial?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, areas, items }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save.");
      return;
    }
    router.push("/dashboard/admin/templates");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card">
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={150} placeholder="Template name (e.g. Monthly infection control audit)" className="field" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={1000} placeholder="Description / instructions (optional)" className="field" />
        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Allocate to</p>
          <div className="flex flex-wrap gap-4">
            {TEMPLATE_AREAS.map((a) => (
              <label key={a.code} className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={areas.includes(a.code)}
                  onChange={(e) => setAreas((cur) => (e.target.checked ? [...cur, a.code] : cur.filter((x) => x !== a.code)))}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold text-ink-800">Questions</h2>
        {items.map((q, i) => (
          <div key={q.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
            <div className="flex flex-col gap-2 sm:flex-row">
              <span className="pt-2 text-sm font-semibold text-ink-600">{i + 1}.</span>
              <input value={q.text} onChange={(e) => update(i, { text: e.target.value })} required maxLength={300} placeholder="Question or check" className="field flex-1" />
              <select value={q.type} onChange={(e) => update(i, { type: e.target.value as ItemType })} className="field sm:w-64">
                {ITEM_TYPES.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
              </select>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 pl-6 text-sm">
              <label className="flex items-center gap-2 text-ink-700">
                <input type="checkbox" checked={q.required} onChange={(e) => update(i, { required: e.target.checked })} /> Required
              </label>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-secondary">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="btn-secondary">↓</button>
              <button type="button" onClick={() => setItems((cur) => cur.filter((_, idx) => idx !== i))} disabled={items.length === 1} className="btn-secondary text-coral-700">Remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setItems((cur) => [...cur, { id: newId(), text: "", type: "PASS_FAIL", required: true }])} className="btn-secondary">
          + Add question
        </button>
        <p className="text-xs text-ink-600">
          Answers of Fail, No or High are flagged and need a note; any flagged answer marks the completed form &quot;Action needed&quot;.
        </p>
      </div>

      {error && <p className="rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving..." : initial?.id ? "Save changes" : "Create template"}</button>
        <button type="button" onClick={() => router.push("/dashboard/admin/templates")} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
