import Link from "next/link";
import type { ReactNode } from "react";

export function CarePlanCategoryTile({
  href,
  icon,
  label,
  count,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[104px] w-[112px] flex-col items-center justify-between gap-1.5 rounded-xl2 border-2 border-green-500 bg-cream-100 px-2 py-2.5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <span className="w-full break-words text-[9px] font-bold uppercase leading-tight tracking-wide text-green-700">
        {label}
      </span>
      <span className="text-green-700">{icon}</span>
      <span className="text-xs font-bold text-ink-800">{count}</span>
    </Link>
  );
}
