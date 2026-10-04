import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResidentSubpageHeader } from "@/components/ResidentSubpageHeader";
import { CarePlanCategoryTile } from "@/components/CarePlanCategoryTile";
import { CARE_PLAN_TABS } from "@/components/carePlanIcons";

export default async function CarePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();

  const carePlanVersions = await prisma.carePlanVersion.findMany({
    where: { residentId: id },
    orderBy: { version: "desc" },
    select: { category: true, version: true },
  });

  const latestVersionByCategory: Record<string, number> = {};
  for (const v of carePlanVersions) {
    if (latestVersionByCategory[v.category] === undefined) {
      latestVersionByCategory[v.category] = v.version;
    }
  }

  return (
    <div>
      <ResidentSubpageHeader residentId={resident.id} residentName={resident.name} title="Care plan" />
      <Link href={`/dashboard/residents/${id}/care-plan/print`} className="btn-secondary mb-4 inline-block">
        Print / save as PDF
      </Link>
      <div className="flex flex-wrap gap-2.5">
        {CARE_PLAN_TABS.map((tab) => (
          <CarePlanCategoryTile
            key={tab.code}
            href={`/dashboard/residents/${id}/care-plan/${tab.code.toLowerCase()}`}
            icon={<tab.icon />}
            label={tab.label}
            count={latestVersionByCategory[tab.code] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
