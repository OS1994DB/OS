const CATEGORY_STYLES: Record<string, string> = {
  GENERAL: "bg-ink-700/10 text-ink-700",
  CARE: "bg-brand-50 text-brand-700",
  HEALTH: "bg-amber-50 text-amber-700",
  INCIDENT: "bg-coral-50 text-coral-700",
  RISK: "bg-coral-50 text-coral-600",
};

export function NoteBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.GENERAL;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {category}
    </span>
  );
}
