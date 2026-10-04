"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ITEM_TYPES, type TemplateItem } from "@/lib/templates";

export type RunnableTemplate = { id: string; name: string; description: string; items: TemplateItem[] };

const LABEL: Record<string, string> = { PASS: "Pass", FAIL: "Fail", NA: "N/A", YES: "Yes", NO: "No", LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export function TemplateRunner({
  area, templates, residentId, askLocation = true,
}: { area: string; templates: RunnableTemplate[]; residentId?: string; askLocation?: boolean }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [location, setLocation] = useState("");
  const [overall, setOverall] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const template = templates.find((t) => t.id === templateId);
  if (templates.length === 0) return null;

  function pick(id: string) {
    setTemplateId(id);
    setValues({});
    setNotes({});
    setError("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!template) return;
    setError("");
    setBusy(true);
    const res = await fetch("/api/templates/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId, area, residentId, location, notes: overall,
        answers: template.items.map((i) => ({ itemId: i.id, value: values[i.id] ?? "", note: notes[i.id] ?? "" })),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save.");
      return;
    }
    pick("");
    setLocation("");
    setOverall("");
    router.refresh();
  }

  const flagged = (type: string, value?: string) => ITEM_TYPES.find((t) => t.code === type)?.flag === value && !!value;

  return (
    <div className="mb-6 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card">
      <label className="mb-2 block text-sm font-medium text-ink-700">Complete a template</label>
      <select value={templateId} onChange={(e) => pick(e.target.value)} className="field sm:max-w-md">
        <option value="">Choose a template…</option>
        {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      {template && (
        <form onSubmit={submit} className="mt-4 space-y-4">
          {template.description && <p className="text-sm text-ink-600">{template.description}</p>}
          {askLocation && <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={150} placeholder="Location / area (optional)" className="field" />}

          {template.items.map((item, idx) => {
            const def = ITEM_TYPES.find((t) => t.code === item.type)!;
            const v = values[item.id];
            return (
              <div key={item.id} className="rounded-xl2 border border-ink-700/10 p-3">
                <p className="mb-2 text-sm font-medium text-ink-800">
                  {idx + 1}. {item.text}{item.required && <span className="text-coral-700"> *</span>}
                </p>
                {def.options.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {def.options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setValues((c) => ({ ...c, [item.id]: o }))}
                        className={`rounded-xl2 border px-3 py-1.5 text-sm font-medium ${
                          v === o
                            ? o === def.flag ? "border-coral-500 bg-coral-50 text-coral-700" : "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-ink-700/15 text-ink-600 hover:bg-white/5"
                        }`}
                      >
                        {LABEL[o]}
                      </button>
                    ))}
                  </div>
                ) : item.type === "NUMBER" ? (
                  <input type="number" step="any" value={v ?? ""} onChange={(e) => setValues((c) => ({ ...c, [item.id]: e.target.value }))} className="field sm:max-w-xs" />
                ) : (
                  <textarea rows={2} value={v ?? ""} onChange={(e) => setValues((c) => ({ ...c, [item.id]: e.target.value }))} className="field" />
                )}
                {(flagged(item.type, v) || notes[item.id]) && item.type !== "TEXT" && (
                  <input
                    value={notes[item.id] ?? ""}
                    onChange={(e) => setNotes((c) => ({ ...c, [item.id]: e.target.value }))}
                    placeholder={flagged(item.type, v) ? "Note required — what is the issue / action?" : "Note (optional)"}
                    className="field mt-2"
                  />
                )}
              </div>
            );
          })}

          <textarea value={overall} onChange={(e) => setOverall(e.target.value)} rows={2} maxLength={1000} placeholder="Overall comments (optional)" className="field" />
          {error && <p className="rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving..." : "Submit"}</button>
            <button type="button" onClick={() => pick("")} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
