import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageMedications } from "@/lib/permissions";
import { ResidentSubpageHeader } from "@/components/ResidentSubpageHeader";
import { MedicationChart } from "@/components/MedicationChart";

const OUTCOME_LABEL: Record<string, string> = { GIVEN: "Given", REFUSED: "Refused", OMITTED: "Omitted", NOT_AVAILABLE: "Not available" };

export default async function MedicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();

  const [active, stopped, history] = await Promise.all([
    prisma.medication.findMany({
      where: { residentId: id, active: true },
      orderBy: { name: "asc" },
      include: { administrations: { orderBy: { administeredAt: "desc" }, take: 1, include: { givenBy: true } } },
    }),
    prisma.medication.findMany({ where: { residentId: id, active: false }, orderBy: { stoppedAt: "desc" } }),
    prisma.medicationAdministration.findMany({
      where: { residentId: id },
      orderBy: { administeredAt: "desc" },
      take: 50,
      include: { medication: true, givenBy: true },
    }),
  ]);

  return (
    <div>
      <ResidentSubpageHeader residentId={resident.id} residentName={resident.name} title="Medication (MAR)" />
      <MedicationChart
        residentId={id}
        canManage={canManageMedications(session!.user.role)}
        meds={active.map((m) => ({
          id: m.id, name: m.name, dose: m.dose, route: m.route, frequency: m.frequency,
          instructions: m.instructions, prn: m.prn,
          last: m.administrations[0]
            ? { outcome: m.administrations[0].outcome, at: m.administrations[0].administeredAt.toISOString(), by: m.administrations[0].givenBy.name }
            : null,
        }))}
      />

      <h2 className="mb-2 mt-8 font-display text-base font-semibold text-ink-800">Recent administrations</h2>
      {history.length === 0 ? (
        <p className="text-sm text-ink-600">Nothing recorded yet.</p>
      ) : (
        <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
          {history.map((h) => (
            <li key={h.id} className="border-b border-ink-700/10 px-4 py-3 text-sm last:border-b-0">
              <span className="font-medium text-ink-800">{h.medication.name}</span>{" "}
              <span className={h.outcome === "GIVEN" ? "text-brand-700" : "text-coral-700"}>{OUTCOME_LABEL[h.outcome] ?? h.outcome}</span>
              <span className="text-ink-600"> · {h.administeredAt.toLocaleString("en-GB")} · {h.givenBy.name}</span>
              {h.notes && <p className="text-ink-700">{h.notes}</p>}
            </li>
          ))}
        </ul>
      )}

      {stopped.length > 0 && (
        <>
          <h2 className="mb-2 mt-8 font-display text-base font-semibold text-ink-800">Stopped medication</h2>
          <ul className="space-y-2">
            {stopped.map((m) => (
              <li key={m.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 px-4 py-3 text-sm text-ink-600">
                {m.name} · {m.dose} — stopped {m.stoppedAt?.toLocaleDateString("en-GB")}: {m.stoppedReason}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
