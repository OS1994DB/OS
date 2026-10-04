"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type PppFileRow = { id: string; name: string; size: number; createdAt: string; by: string };
export type FolderOption = { id: string; path: string };

function kb(n: number) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// Add folder (anywhere) and Add file (only inside a folder).
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
      <div className="flex flex-wrap gap-2">
        {folderId && <button onClick={() => setMode("file")} className="btn-primary">+ Add file</button>}
        <button onClick={() => setMode("folder")} className={folderId ? "btn-secondary" : "btn-primary"}>+ Add folder</button>
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
    if (!target) return;
    setError("");
    const res = await fetch(`/api/ppp/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId: target }),
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

  // Nothing to show: no empty-state message.
  if (files.length === 0) return null;

  const targets = folders.filter((o) => o.id !== currentFolderId);
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
                <select defaultValue="" onChange={(e) => move(f.id, e.target.value)} className="field w-52">
                  <option value="" disabled>Move to folder…</option>
                  {targets.map((o) => <option key={o.id} value={o.id}>{o.path}</option>)}
                </select>
                <button onClick={() => setMoving(null)} className="btn-secondary">Cancel</button>
              </span>
            ) : (
              <span className="flex gap-2">
                {targets.length > 0 && <button onClick={() => setMoving(f.id)} className="btn-secondary">Move</button>}
                <button onClick={() => remove(f.id, f.name)} className="btn-secondary text-coral-700">Delete</button>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}

// Deletes a folder. Non-empty folders ask for confirmation, quoting exactly what will go.
export function DeleteFolderButton({
  id, name, afterHref, small = false,
}: { id: string; name: string; afterHref?: string; small?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function del() {
    if (!window.confirm(`Delete the folder "${name}"?`)) return;
    setError("");
    setBusy(true);
    let res = await fetch(`/api/ppp/folders/${id}`, { method: "DELETE" });
    if (res.status === 409) {
      // Not empty: say exactly what will be lost and ask again.
      const info = await res.json().catch(() => ({}));
      const parts = [
        info.fileCount ? `${info.fileCount} file${info.fileCount === 1 ? "" : "s"}` : "",
        info.subfolderCount ? `${info.subfolderCount} subfolder${info.subfolderCount === 1 ? "" : "s"}` : "",
      ].filter(Boolean).join(" and ");
      if (!window.confirm(`"${name}" contains ${parts}. Deleting it permanently deletes all of them. Delete anyway?`)) {
        setBusy(false);
        return;
      }
      res = await fetch(`/api/ppp/folders/${id}?confirm=true`, { method: "DELETE" });
    }
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Delete failed.");
      return;
    }
    if (afterHref) router.push(afterHref);
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-center">
      <button onClick={del} disabled={busy} className={`btn-secondary text-coral-700 ${small ? "!px-2.5 !py-1 text-xs" : ""}`}>
        {busy ? "Deleting..." : small ? "Delete" : "Delete folder"}
      </button>
      {error && <span className="mt-1 text-xs text-coral-700">{error}</span>}
    </span>
  );
}
