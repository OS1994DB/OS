import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";

// Consistent "← Back" link used across pages.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-600 transition-colors hover:text-brand-600"
    >
      <ChevronLeftIcon />
      Back to {label}
    </Link>
  );
}
