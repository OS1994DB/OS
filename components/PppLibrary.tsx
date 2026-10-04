"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type PppFileRow = { id: string; name: string; size: number; createdAt: string; by: string };
export type FolderOption = { id: string; path: string };

function kb(n: number) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function PppActions({ folderId, canManage }: { folderId: string | null; canManage: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"file" | "folder" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!canManage) return null;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    let res: Response;
    if (mode === "file") {
      f.set("folderId", folderId ?? "");
      res = await fetch("/api/ppp/files", { method: "POST", body: f });
    } else {
      res = await fetch("/api/ppp/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.get("name"), parentId: folderId }),
      });
    }
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed.");
      return;
    }
    setMode(null);
    router.refresh();
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <button onClick={() => setMode("file")} className="btn-primary">+ Add file</button>
        <button onClick={() => setMode("folder")} className="btn-secondary">+ Add folder</button>
      </div>
      {mode && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-3 rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card sm:flex-row sm:items-center">
          {mode === "file" ? (
            <input name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg" className="field flex-1" />
          ) : (
            <input name="name" required maxLength={100} placeholder="Folder name" className="field flex-1" />
          )}
          <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving..." : mode === "file" ? "Upload" : "Create"}</button>
          <button type="button" onClick={() => setMode(null)} className="btn-secondary">Cancel</button>
        </form>
      )}
      {error && <p className="mt-2 rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
    </div>
  );
}

export function PppFileList({
  files, folders, currentFolderId, canManage,
}: { files: PppFileRow[]; folders: FolderOption[]; currentFolderId: string | null; canManage: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [moving, setMoving] = useState<string | null>(null);

  async function move(id: string, target: string) {
    setError("");
    const res = await fetch(`/api/ppp/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId: target || null }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Move failed.");
      return;
    }
    setMoving(null);
    router.refresh();
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setError("");
    const res = await fetch(`/api/ppp/files/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Delete failed.");
      return;
    }
    router.refresh();
  }

  if (files.length === 0) {
    return <p className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-8 text-center text-sm text-ink-600">No files here.</p>;
  }
  return (
    <>
      {error && <p className="mb-2 rounded-xl2 bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
      <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
        {files.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-700/10 px-4 py-3 text-sm last:border-b-0">
            <a href={`/api/ppp/files/${f.id}`} className="min-w-0 flex-1 truncate font-medium text-brand-700 hover:underline">{f.name}</a>
            <span className="text-xs text-ink-600">{kb(f.size)} · {new Date(f.createdAt).toLocaleDateString("en-GB")} · {f.by}</span>
            {canManage && (moving === f.id ? (
              <span className="flex items-center gap-2">
                <select defaultValue={currentFolderId ?? ""} onChange={(e) => move(f.id, e.target.value)} className="field w-52">
                  <option value="">Top level</option>
                  {folders.map((o) => <option key={o.id} value={o.id}>{o.path}</option>)}
                </select>
                <button onClick={() => setMoving(null)} className="btn-secondary">Cancel</button>
              </span>
            ) : (
              <span className="flex gap-2">
                <button onClick={() => setMoving(f.id)} className="btn-secondary">Move</button>
                <button onClick={() => remove(f.id, f.name)} className="btn-secondary text-coral-700">Delete</button>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
