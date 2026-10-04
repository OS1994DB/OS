"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type PpeRow = { id: string; name: string; unit: string; reorderLevel: number; stock: number };

export function PpeStock({ items, canManage }: { items: PpeRow[]; canManage: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  async function call(url: string, body: unknown) {
    setError("");
    setBusy(true);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Request failed.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function move(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const qty = Number(f.get("qty"));
    const sign = f.get("dir") === "in" ? 1 : -1;
    if (await call(`/api/ppe/items/${id}/movements`, { change: sign * qty, note: f.get("note") })) form.reset();
  }

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (await call("/api/ppe/items", { name: f.get("name"), unit: f.get("unit"), reorderLevel: Number(f.get("reorderLevel") || 0) })) setAdding(false);
  }

  return (
    <div>
      {canManage && !adding && <button onClick={() => setAdding(true)} className="btn-primary mb-4">+ Add item</button>}
      {adding && (
        <form onSubmit={addItem} className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card sm:grid-cols-3">
          <input name="name" required placeholder="Item (e.g. Nitrile gloves M)" className="field" />
          <input name="unit" placeholder="Unit (box, pack…)" className="field" />
          <input name="reorderLevel" type="number" min={0} placeholder="Reorder at (qty)" className="field" />
          <div className="flex gap-2 sm:col-span-3">
            <button type="submit" disabled={busy} className="btn-primary">Save</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}
      {error && <p className="mb-3 rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
      {items.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
          <p className="text-sm text-ink-600">No items tracked yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => {
            const low = i.stock <= i.reorderLevel;
            return (
              <li key={i.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink-800">{i.name}</p>
                    <p className={`text-sm ${low ? "text-coral-700" : "text-ink-600"}`}>
                      {i.stock} {i.unit} on hand{i.reorderLevel > 0 && ` · reorder at ${i.reorderLevel}`}{low && " · LOW"}
                    </p>
                  </div>
                  <form onSubmit={(e) => move(e, i.id)} className="flex flex-wrap gap-2">
                    <select name="dir" className="field w-28"><option value="out">Used</option><option value="in">Received</option></select>
                    <input name="qty" type="number" min={1} required defaultValue={1} className="field w-20" />
                    <input name="note" placeholder="Note" className="field w-40" />
                    <button type="submit" disabled={busy} className="btn-primary">Save</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
