import { CategoryTile, CategoryTileRow } from "@/components/CategoryTile";
import { CarePlanIcon, AssessmentIcon, NoteIcon, ShieldAlertIcon } from "@/components/icons";

export function ResidentGreenSection({
  residentId,
  carePlanCategoriesFilled,
  assessmentsCount,
  riskAssessmentsCount,
  notesCount,
}: {
  residentId: string;
  carePlanCategoriesFilled: number;
  assessmentsCount: number;
  riskAssessmentsCount: number;
  notesCount: number;
}) {
  const base = `/dashboard/residents/${residentId}`;

  return (
    <CategoryTileRow color="green" title="Care" icon={<CarePlanIcon className="h-4 w-4" />}>
      <CategoryTile color="green" icon={<CarePlanIcon />} label="Care plan" count={carePlanCategoriesFilled} href={`${base}/care-plan`} />
      <CategoryTile color="green" icon={<AssessmentIcon />} label="Assessments" count={assessmentsCount} href={`${base}/assessments`} />
      <CategoryTile color="green" icon={<NoteIcon />} label="Daily notes" count={notesCount} href={`${base}/daily-notes`} />
      <CategoryTile color="green" icon={<ShieldAlertIcon />} label="Risk assess." count={riskAssessmentsCount} href={`${base}/risk-assessments`} />
    </CategoryTileRow>
  );
}
