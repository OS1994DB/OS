import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canReviewIncidents } from "@/lib/permissions";
import { loadIncidents } from "@/lib/incidentQueries";
import { ResidentSubpageHeader } from "@/components/ResidentSubpageHeader";
import { IncidentList } from "@/components/IncidentList";

export default async function ResidentIncidentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();
  const incidents = await loadIncidents({ residentId: id });

  return (
    <div>
      <ResidentSubpageHeader residentId={resident.id} residentName={resident.name} title="Incidents" />
      <div className="mb-4 flex justify-end">
        <Link href={`/dashboard/residents/${id}/incidents/new`} className="btn-primary">+ Report incident</Link>
      </div>
      <IncidentList incidents={incidents} canReview={canReviewIncidents(session!.user.role)} showResident={false} />
    </div>
  );
}
