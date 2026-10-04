import Link from "next/link";
import { initials } from "@/lib/formatting";
import { ChevronLeftIcon } from "@/components/icons";

export function ResidentSubpageHeader({
  residentId,
  residentName,
  title,
  backHref,
  backLabel,
}: {
  residentId: string;
  residentName: string;
  title: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-6">
      <Link
        href={backHref ?? `/dashboard/residents/${residentId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-600 transition-colors hover:text-brand-600"
      >
        <ChevronLeftIcon />
        Back to {backLabel ?? residentName}
      </Link>
      <div className="flex items-center gap-4 rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand-500/40 bg-brand-50 font-display text-sm font-semibold text-brand-700">
          {initials(residentName)}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-ink-600">{residentName}</p>
          <h1 className="font-display text-lg font-bold text-ink-800">{title}</h1>
        </div>
      </div>
    </div>
  );
}
