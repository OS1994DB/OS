import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAddAssessments } from "@/lib/permissions";
import { ResidentSubpageHeader } from "@/components/ResidentSubpageHeader";
import { AddAssessmentForm } from "@/components/AddAssessmentForm";
import { AssessmentsList } from "@/components/AssessmentsList";

export default async function RiskAssessmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const role = session!.user.role;

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();

  const assessments = await prisma.assessment.findMany({
    where: { residentId: id, kind: "RISK" },
    orderBy: { createdAt: "desc" },
    include: { completedBy: true },
  });

  return (
    <div>
      <ResidentSubpageHeader residentId={resident.id} residentName={resident.name} title="Risk assessments" />
      <div className="mb-3 flex items-center justify-end">
        {canAddAssessments(role) && <AddAssessmentForm residentId={resident.id} kind="RISK" />}
      </div>
      <AssessmentsList assessments={assessments} kind="RISK" />
    </div>
  );
}
