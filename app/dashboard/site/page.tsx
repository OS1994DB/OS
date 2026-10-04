import { prisma } from "@/lib/prisma";
import { SITE_CHECK_TYPES } from "@/lib/siteChecks";
import { SiteCheckForm } from "@/components/SiteCheckForm";

const DAY = 86_400_000;

export default async function SitePage() {
  const recent = await prisma.siteCheck.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { checkedBy: true },
  });
  const label = (code: string) => SITE_CHECK_TYPES.find((t) => t.code === code)?.label ?? code;

  const scheduled = SITE_CHECK_TYPES.filter((t) => t.everyDays > 0).map((t) => {
    const last = recent.find((c) => c.type === t.code);
    const overdue = !last || Date.now() - last.createdAt.getTime() > t.everyDays * DAY;
    return { ...t, last, overdue };
  });
  const recentFails = recent.filter((c) => c.result === "FAIL").slice(0, 5);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Site</h1>
          <p className="mt-1 text-sm text-ink-600">Building safety checks and maintenance</p>
        </div>
        <SiteCheckForm />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scheduled.map((t) => (
          <div key={t.code} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
            <p className="font-medium text-ink-800">{t.label}</p>
            <p className="text-xs text-ink-600">Every {t.everyDays} days</p>
            <p className={`mt-2 text-sm ${t.overdue ? "text-coral-700" : "text-brand-700"}`}>
              {t.last ? `Last: ${t.last.createdAt.toLocaleDateString("en-GB")} (${t.last.result.toLowerCase()})` : "Never logged"}
              {t.overdue && " · overdue"}
            </p>
          </div>
        ))}
      </div>

      {recentFails.length > 0 && (
        <div className="mb-8 rounded-xl2 border border-coral-700/30 bg-coral-50 p-4">
          <p className="mb-2 text-sm font-semibold text-coral-700">Recent failed checks / issues</p>
          <ul className="space-y-1 text-sm text-coral-700">
            {recentFails.map((c) => (
              <li key={c.id}>{c.createdAt.toLocaleDateString("en-GB")} · {label(c.type)}{c.area && ` · ${c.area}`}: {c.notes}</li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-2 font-display text-base font-semibold text-ink-800">Check log</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-ink-600">No checks logged yet.</p>
      ) : (
        <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
          {recent.map((c) => (
            <li key={c.id} className="border-b border-ink-700/10 px-4 py-3 text-sm last:border-b-0">
              <span className="font-medium text-ink-800">{label(c.type)}</span>
              {c.area && <span className="text-ink-600"> · {c.area}</span>}{" "}
              <span className={c.result === "PASS" ? "text-brand-700" : "text-coral-700"}>{c.result.toLowerCase()}</span>
              <span className="text-ink-600"> · {c.createdAt.toLocaleString("en-GB")} · {c.checkedBy.name}</span>
              {c.notes && <p className="text-ink-700">{c.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
