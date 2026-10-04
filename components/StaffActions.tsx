"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StaffActions({ id, active, isSelf }: { id: string; active: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function patch(body: Record<string, unknown>) {
    setError("");
    setBusy(true);
    const res = await fetch(`/api/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Update failed.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function resetPassword() {
    const password = window.prompt("New temporary password (min 8 characters):");
    if (!password) return;
    if (await patch({ password })) window.alert("Password updated. Share it with the staff member securely.");
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex gap-2">
        <button onClick={resetPassword} disabled={busy} className="btn-secondary">
          Reset password
        </button>
        {!isSelf && (
          <button onClick={() => patch({ active: !active })} disabled={busy} className="btn-secondary">
            {active ? "Deactivate" : "Reactivate"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-coral-700">{error}</p>}
    </div>
  );
}
