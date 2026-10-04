import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CARE_PLAN_CATEGORIES } from "@/lib/carePlanCategories";
import { PrintButton } from "@/components/PrintButton";

const FIELDS = [
  ["identifiedRisk", "Identified risk"],
  ["residentPerspective", "Resident perspective"],
  ["careSupport", "Care and support"],
  ["careDirective", "Care directive"],
  ["reviewSummary", "Review summary"],
] as const;

export default async function PrintCarePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();

  const versions = await prisma.carePlanVersion.findMany({
    where: { residentId: id },
    orderBy: { version: "desc" },
    include: { createdBy: true },
  });
  const latest = new Map<string, (typeof versions)[number]>();
  for (const v of versions) if (!latest.has(v.category)) latest.set(v.category, v);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/dashboard/residents/${id}/care-plan`} className="text-sm font-medium text-ink-600 hover:text-brand-600">
          ← Back to care plan
        </Link>
        <PrintButton />
      </div>

      <h1 className="font-display text-2xl font-bold text-ink-800">Care plan — {resident.name}</h1>
      <p className="mb-6 text-sm text-ink-600">
        Room {resident.roomNumber} · DOB {resident.dateOfBirth.toLocaleDateString("en-GB")}
        {resident.nhsNumber && ` · NHS ${resident.nhsNumber}`} · Printed {new Date().toLocaleDateString("en-GB")}
      </p>

      {CARE_PLAN_CATEGORIES.filter((c) => latest.has(c.code)).map((c) => {
        const v = latest.get(c.code)!;
        return (
          <section key={c.code} className="mb-5 break-inside-avoid border-t border-ink-700/20 pt-3">
            <h2 className="font-display text-base font-semibold text-ink-800">
              {c.label} <span className="text-xs font-normal text-ink-600">v{v.version} · {v.createdAt.toLocaleDateString("en-GB")} · {v.createdBy.name}</span>
            </h2>
            {FIELDS.map(([key, label]) =>
              v[key] ? (
                <p key={key} className="mt-1 whitespace-pre-wrap text-sm text-ink-700">
                  <b>{label}:</b> {v[key]}
                </p>
              ) : null,
            )}
          </section>
        );
      })}
      {latest.size === 0 && <p className="text-sm text-ink-600">No care plan entries yet.</p>}
    </div>
  );
}
