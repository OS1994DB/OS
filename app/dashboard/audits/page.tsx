import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canCompleteTemplate } from "@/lib/permissions";
import { runnableTemplates, recentSubmissions } from "@/lib/templateQueries";
import { TemplateRunner } from "@/components/TemplateRunner";
import { SubmissionList } from "@/components/SubmissionList";

export default async function AuditsPage() {
  const session = await getServerSession(authOptions);
  const canRun = canCompleteTemplate(session!.user.role, "AUDIT");
  const [templates, rows] = await Promise.all([runnableTemplates("AUDIT"), recentSubmissions("AUDIT")]);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Audits</h1>
        <p className="mt-1 text-sm text-ink-600">Complete audit templates set up by the manager</p>
      </div>
      {canRun ? (
        templates.length === 0 ? (
          <p className="mb-6 rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-8 text-center text-sm text-ink-600">
            No audit templates allocated yet. A manager can create one in Admin → Templates.
          </p>
        ) : (
          <TemplateRunner area="AUDIT" templates={templates} />
        )
      ) : (
        <p className="mb-6 text-sm text-ink-600">Audits are completed by senior carers and managers. You can view results below.</p>
      )}
      <SubmissionList rows={rows} title="Completed audits" empty="No audits completed yet." />
    </div>
  );
}
