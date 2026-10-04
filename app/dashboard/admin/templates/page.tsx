import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BackLink } from "@/components/BackLink";
import { prisma } from "@/lib/prisma";
import { canManageTemplates } from "@/lib/permissions";
import { TEMPLATE_AREAS, parseAreas, parseItems } from "@/lib/templates";
import { TemplateActiveToggle } from "@/components/TemplateActiveToggle";

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!canManageTemplates(session!.user.role)) redirect("/dashboard");

  const [templates, counts] = await Promise.all([
    prisma.checklistTemplate.findMany({ orderBy: { name: "asc" } }),
    prisma.checklistSubmission.groupBy({ by: ["templateId"], _count: true }),
  ]);
  const used = new Map(counts.map((c) => [c.templateId, c._count]));
  const areaLabel = (c: string) => TEMPLATE_AREAS.find((a) => a.code === c)?.label ?? c;

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Admin" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Templates</h1>
          <p className="mt-1 text-sm text-ink-600">Audits, risk assessments and checks, allocated to areas of the system</p>
        </div>
        <Link href="/dashboard/admin/templates/new" className="btn-primary">+ New template</Link>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
          <p className="text-sm text-ink-600">No templates yet. Create one and allocate it to Site checks, Risk assessments, Housekeeping or Audits.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {templates.map((t) => (
            <li key={t.id} className={`rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card ${t.active ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-800">
                    {t.name}{!t.active && <span className="ml-2 text-xs font-normal text-ink-600">(inactive)</span>}
                  </p>
                  {t.description && <p className="text-sm text-ink-600">{t.description}</p>}
                  <p className="mt-1 text-xs text-ink-600">
                    {parseItems(t.items).length} questions · v{t.version} · completed {used.get(t.id) ?? 0} times
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {parseAreas(t.areas).map((a) => (
                      <span key={a} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{areaLabel(a)}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/admin/templates/${t.id}`} className="btn-secondary">Edit</Link>
                  <TemplateActiveToggle id={t.id} active={t.active} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
