import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageTemplates } from "@/lib/permissions";
import { parseAreas, parseItems } from "@/lib/templates";
import { TemplateBuilder } from "@/components/TemplateBuilder";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!canManageTemplates(session!.user.role)) redirect("/dashboard");
  const t = await prisma.checklistTemplate.findUnique({ where: { id } });
  if (!t) notFound();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Edit template</h1>
      <p className="mb-6 mt-1 text-sm text-ink-600">
        Saving creates version {t.version + 1}. Forms already completed keep the questions they were answered with.
      </p>
      <TemplateBuilder initial={{ id: t.id, name: t.name, description: t.description, areas: parseAreas(t.areas), items: parseItems(t.items) }} />
    </div>
  );
}
