import type { ReactNode } from "react";
import { initials } from "@/lib/formatting";
import { roleLabel } from "@/lib/permissions";

const ROLE_STYLES: Record<string, string> = {
  MANAGER: "bg-coral-50 text-coral-700",
  SENIOR_CARER: "bg-amber-50 text-amber-700",
  CARER: "bg-ink-700/10 text-ink-700",
  HOUSEKEEPING: "bg-brand-50 text-brand-700",
  COOK: "bg-brand-50 text-brand-700",
};

// Square card matching the Residents grid.
export function StaffCard({
  name, email, role, active = true, children,
}: { name: string; email: string; role: string; active?: boolean; children?: ReactNode }) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 text-center shadow-card ${
        active ? "" : "opacity-60"
      }`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 font-display text-lg font-semibold text-brand-700">
        {initials(name)}
      </div>
      <p className="mt-3 font-display font-semibold text-ink-800">{name}</p>
      <span className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[role] ?? ROLE_STYLES.CARER}`}>
        {roleLabel(role)}
      </span>
      <p className="mt-1.5 w-full truncate text-xs text-ink-600/70">{email}</p>
      {!active && <p className="mt-1 text-xs text-ink-600">Removed — can&apos;t sign in</p>}
      {children}
    </div>
  );
}
