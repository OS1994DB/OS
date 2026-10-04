import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResidentSubpageHeader } from "@/components/ResidentSubpageHeader";
import { IncidentForm } from "@/components/IncidentForm";

export default async function NewResidentIncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();
  return (
    <div>
      <ResidentSubpageHeader
        residentId={resident.id}
        residentName={resident.name}
        title="Report incident"
        backHref={`/dashboard/residents/${id}/incidents`}
        backLabel="incidents"
      />
      <IncidentForm residentId={resident.id} />
    </div>
  );
}
