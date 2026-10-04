import { prisma } from "@/lib/prisma";
import { HOUSEKEEPING_TASKS } from "@/lib/housekeeping";
import { HousekeepingForm } from "@/components/HousekeepingForm";
import { runnableTemplates, recentSubmissions } from "@/lib/templateQueries";
import { TemplateRunner } from "@/components/TemplateRunner";
import { SubmissionList } from "@/components/SubmissionList";

export default async function HousekeepingPage() {
  const since = new Date(Date.now() - 86_400_000);
  const [logs, todayCount] = await Promise.all([
    prisma.housekeepingLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { doneBy: true } }),
    prisma.housekeepingLog.count({ where: { createdAt: { gte: since }, status: "DONE" } }),
  ]);
  const [templates, submissions] = await Promise.all([runnableTemplates("HOUSEKEEPING"), recentSubmissions("HOUSEKEEPING")]);
  const label = (c: string) => HOUSEKEEPING_TASKS.find((t) => t.code === c)?.label ?? c;
  // An area's latest entry decides whether it still needs attention.
  const latestByAreaTask = new Map<string, (typeof logs)[number]>();
  for (const l of logs) {
    const key = `${l.area.toLowerCase()}|${l.task}`;
    if (!latestByAreaTask.has(key)) latestByAreaTask.set(key, l);
  }
  const open = [...latestByAreaTask.values()].filter((l) => l.status === "NEEDS_ATTENTION");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Housekeeping</h1>
          <p className="mt-1 text-sm text-ink-600">{todayCount} tasks completed in the last 24 hours</p>
        </div>
        <HousekeepingForm />
      </div>

      <TemplateRunner area="HOUSEKEEPING" templates={templates} />

      {open.length > 0 && (
        <div className="mb-8 rounded-xl2 border border-coral-700/30 bg-coral-50 p-4">
          <p className="mb-2 text-sm font-semibold text-coral-700">Needs attention</p>
          <ul className="space-y-1 text-sm text-coral-700">
            {open.map((l) => (
              <li key={l.id}>{l.area} · {label(l.task)} · {l.createdAt.toLocaleDateString("en-GB")}: {l.notes}</li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-2 font-display text-base font-semibold text-ink-800">Log</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-ink-600">Nothing logged yet.</p>
      ) : (
        <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
          {logs.map((l) => (
            <li key={l.id} className="border-b border-ink-700/10 px-4 py-3 text-sm last:border-b-0">
              <span className="font-medium text-ink-800">{l.area}</span>
              <span className="text-ink-600"> · {label(l.task)}</span>{" "}
              <span className={l.status === "DONE" ? "text-brand-700" : "text-coral-700"}>
                {l.status === "DONE" ? "done" : "needs attention"}
              </span>
              <span className="text-ink-600"> · {l.createdAt.toLocaleString("en-GB")} · {l.doneBy.name}</span>
              {l.notes && <p className="text-ink-700">{l.notes}</p>}
            </li>
          ))}
        </ul>
      )}
      <SubmissionList rows={submissions} title="Completed housekeeping templates" empty="No templates completed yet." />
    </div>
  );
}
