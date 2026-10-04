import { prisma } from "@/lib/prisma";
import { IncidentForm } from "@/components/IncidentForm";

export default async function NewIncidentPage({ searchParams }: { searchParams: Promise<{ residentId?: string }> }) {
  const { residentId } = await searchParams;
  const residents = await prisma.resident.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight text-ink-800">Report incident</h1>
      <IncidentForm residents={residents} defaultResidentId={residentId} />
    </div>
  );
}
