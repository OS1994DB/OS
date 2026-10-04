import Link from "next/link";
import type { ReactNode } from "react";

export function StatTile({
  icon,
  iconColor,
  label,
  value,
  sublabel,
  attention,
  href,
}: {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
  sublabel?: string;
  attention?: boolean;
  href?: string;
}) {
  const content = (
    <div
      className={`group rounded-xl2 border bg-cream-100 p-5 shadow-card transition-all ${
        attention ? "border-coral-500/30 ring-1 ring-coral-500/10" : "border-ink-700/10"
      } ${href ? "hover:-translate-y-0.5 hover:shadow-soft" : ""}`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl2 ${iconColor}`}>
          {icon}
        </span>
        <span className="text-sm font-medium text-ink-600">{label}</span>
      </div>
      <p className="font-display text-3xl font-semibold tracking-tight text-ink-800">{value}</p>
      {sublabel && (
        <p className={`mt-1.5 text-xs ${attention ? "font-medium text-coral-700" : "text-ink-600"}`}>
          {sublabel}
        </p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
