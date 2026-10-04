"use client";

import { useRouter } from "next/navigation";

export function TemplateActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  async function toggle() {
    const res = await fetch(`/api/admin/templates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    if (res.ok) router.refresh();
  }
  return <button onClick={toggle} className="btn-secondary">{active ? "Deactivate" : "Activate"}</button>;
}
