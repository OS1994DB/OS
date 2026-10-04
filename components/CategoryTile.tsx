import type { ReactNode } from "react";
import Link from "next/link";

const COLOR_STYLES: Record<string, { border: string; text: string; ring: string }> = {
  red: { border: "border-coral-500", text: "text-coral-700", ring: "ring-coral-500" },
  green: { border: "border-green-500", text: "text-green-700", ring: "ring-green-500" },
  pink: { border: "border-pink-500", text: "text-pink-700", ring: "ring-pink-500" },
  orange: { border: "border-orange-500", text: "text-orange-700", ring: "ring-orange-500" },
};

export function CategoryTile({
  color,
  icon,
  label,
  count,
  active,
  href,
  onClick,
}: {
  color: "red" | "green" | "pink" | "orange";
  icon: ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const styles = COLOR_STYLES[color];
  const interactive = !!onClick || !!href;

  const classes = `flex h-[84px] w-[92px] flex-col items-center justify-between rounded-xl2 border-2 bg-cream-100 px-2 py-2 text-center shadow-card transition-all ${styles.border} ${
    interactive ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-soft" : "cursor-default"
  } ${active ? `ring-2 ring-offset-2 ring-offset-cream-50 ${styles.ring}` : ""}`;

  const content = (
    <>
      <span className={`text-[9px] font-bold uppercase leading-tight tracking-wide ${styles.text}`}>{label}</span>
      <span className={styles.text}>{icon}</span>
      <span className="h-3 text-xs font-bold text-ink-800">{count !== undefined ? count : ""}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={!interactive} className={classes}>
      {content}
    </button>
  );
}

export function CategoryTileRow({
  color,
  title,
  icon,
  children,
}: {
  color: "red" | "green" | "pink" | "orange";
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const styles = COLOR_STYLES[color];
  return (
    <div className="mb-6">
      <div className={`mb-2 flex items-center gap-1.5 text-sm font-semibold ${styles.text}`}>
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}
