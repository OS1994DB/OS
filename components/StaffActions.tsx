"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StaffActions({ id, name, active, isSelf }: { id: string; name: string; active: boolean; isSelf: boolean }) {
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
    const password = window.prompt(`New temporary password for ${name} (min 8 characters):`);
    if (!password) return;
    if (await patch({ password })) window.alert("Password updated. Share it with the employee securely.");
  }

  async function remove() {
    if (window.confirm(`Remove ${name}? They won't be able to sign in. Their history is kept and you can reactivate them later.`)) {
      await patch({ active: false });
    }
  }

  return (
    <div className="mt-3 flex w-full flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {active && <button onClick={resetPassword} disabled={busy} className="btn-secondary">Reset password</button>}
        {!isSelf && active && <button onClick={remove} disabled={busy} className="btn-secondary text-coral-700">Remove</button>}
        {!active && <button onClick={() => patch({ active: true })} disabled={busy} className="btn-secondary">Reactivate</button>}
      </div>
      {error && <p className="text-xs text-coral-700">{error}</p>}
    </div>
  );
}
