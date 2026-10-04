import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageResidents } from "@/lib/permissions";
import { BackLink } from "@/components/BackLink";
import { ResidentGreenSection } from "@/components/ResidentGreenSection";
import { ResidentInfoBar } from "@/components/ResidentInfoBar";
import { EditableField } from "@/components/EditableField";
import { CategoryTile, CategoryTileRow } from "@/components/CategoryTile";
import { initials } from "@/lib/formatting";
import {
  AlertTriangleIcon,
  MedicalCrossIcon,
  CalendarIcon,
  FolderIcon,
  WalletIcon,
  BoxIcon,
} from "@/components/icons";

function calculateAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const notYetBirthday =
    now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (notYetBirthday) age--;
  return age;
}

function formatDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString("en-GB");
}

export default async function ResidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const role = session!.user.role;

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();

  const [carePlanCategories, notesCount, assessmentsCount, riskAssessmentsCount, details, incidentsCount] = await Promise.all([
    prisma.carePlanVersion.findMany({ where: { residentId: id }, distinct: ["category"], select: { category: true } }),
    prisma.note.count({ where: { residentId: id } }),
    prisma.assessment.count({ where: { residentId: id, kind: "GENERAL" } }),
    prisma.assessment.count({ where: { residentId: id, kind: "RISK" } }),
    prisma.residentDetail.findMany({
      where: { residentId: id },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true },
    }),
    prisma.incident.count({ where: { residentId: id } }),
  ]);

  const canEditProfile = canManageResidents(role);
  const carePlanCategoriesFilled = carePlanCategories.length;

  return (
    <div>
      <BackLink href="/dashboard/residents" label="residents" />
      <div className="mb-6 flex items-center gap-5 rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 shadow-card">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-brand-500/40 bg-brand-50 font-display text-2xl font-semibold text-brand-700">
          {initials(resident.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-ink-800">{resident.name}</h1>
          <p className="mt-0.5 text-sm text-ink-600">
            Key contact: {resident.keyContactName} ({resident.keyContactPhone})
          </p>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
            <EditableField
              residentId={resident.id}
              field="roomNumber"
              label="Bedroom"
              value={resident.roomNumber}
              display={resident.roomNumber}
              canEdit={canEditProfile}
            />
            <EditableField
              residentId={resident.id}
              field="dateOfBirth"
              label="Date of birth"
              type="date"
              value={formatDateInput(resident.dateOfBirth)}
              display={`${formatDateDisplay(resident.dateOfBirth)} (${calculateAge(resident.dateOfBirth)} years old)`}
              canEdit={canEditProfile}
            />
            <EditableField
              residentId={resident.id}
              field="admittedAt"
              label="Admission date"
              type="date"
              value={formatDateInput(resident.admittedAt)}
              display={formatDateDisplay(resident.admittedAt)}
              canEdit={canEditProfile}
            />
            <EditableField
              residentId={resident.id}
              field="nhsNumber"
              label="NHS number"
              value={resident.nhsNumber ?? ""}
              display={resident.nhsNumber || "Not recorded"}
              canEdit={canEditProfile}
            />
            <EditableField
              residentId={resident.id}
              field="customReference"
              label="Reference"
              value={resident.customReference ?? ""}
              display={resident.customReference || "Not set"}
              canEdit={canEditProfile}
            />
          </div>
        </div>
      </div>

      <ResidentGreenSection
        residentId={resident.id}
        carePlanCategoriesFilled={carePlanCategoriesFilled}
        assessmentsCount={assessmentsCount}
        riskAssessmentsCount={riskAssessmentsCount}
        notesCount={notesCount}
      />

      <CategoryTileRow color="red" title="Behaviour & incidents" icon={<AlertTriangleIcon className="h-4 w-4" />}>
        <CategoryTile color="red" icon={<AlertTriangleIcon />} label="ABC charts" />
        <CategoryTile color="red" icon={<AlertTriangleIcon />} label="Near misses" />
        <CategoryTile color="red" icon={<AlertTriangleIcon />} label="Accidents" />
        <CategoryTile color="red" icon={<AlertTriangleIcon />} label="Falls" />
        <CategoryTile color="red" icon={<AlertTriangleIcon />} label="Incidents" count={incidentsCount} href={`/dashboard/residents/${resident.id}/incidents`} />
      </CategoryTileRow>

      <CategoryTileRow color="pink" title="Medical" icon={<MedicalCrossIcon className="h-4 w-4" />}>
        <CategoryTile color="pink" icon={<MedicalCrossIcon />} label="Medication (MAR)" href={`/dashboard/residents/${resident.id}/medications`} />
        <CategoryTile color="pink" icon={<MedicalCrossIcon />} label="Creams" />
        <CategoryTile color="pink" icon={<MedicalCrossIcon />} label="Wounds" />
        <CategoryTile color="pink" icon={<MedicalCrossIcon />} label="Hospital" />
        <CategoryTile color="pink" icon={<CalendarIcon />} label="Appointments" />
      </CategoryTileRow>

      <CategoryTileRow color="orange" title="Belongings & documents" icon={<FolderIcon className="h-4 w-4" />}>
        <CategoryTile color="orange" icon={<FolderIcon />} label="Documents" />
        <CategoryTile color="orange" icon={<WalletIcon />} label="Wallet" />
        <CategoryTile color="orange" icon={<BoxIcon />} label="Property" />
      </CategoryTileRow>

      <ResidentInfoBar
        residentId={resident.id}
        initialDetails={details.map((d) => ({
          id: d.id,
          section: d.section,
          content: d.content,
          createdAt: d.createdAt.toISOString(),
          createdBy: { name: d.createdBy.name },
        }))}
      />
    </div>
  );
}
