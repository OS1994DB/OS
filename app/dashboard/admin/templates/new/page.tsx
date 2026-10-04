import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageTemplates } from "@/lib/permissions";
import { TemplateBuilder } from "@/components/TemplateBuilder";

export default async function NewTemplatePage() {
  const session = await getServerSession(authOptions);
  if (!canManageTemplates(session!.user.role)) redirect("/dashboard");
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight text-ink-800">New template</h1>
      <TemplateBuilder />
    </div>
  );
}
