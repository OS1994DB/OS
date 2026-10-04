import { prisma } from "@/lib/prisma";
import { parseAreas, parseItems } from "@/lib/templates";
import type { RunnableTemplate } from "@/components/TemplateRunner";

export async function runnableTemplates(area: string): Promise<RunnableTemplate[]> {
  const all = await prisma.checklistTemplate.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return all
    .filter((t) => parseAreas(t.areas).includes(area))
    .map((t) => ({ id: t.id, name: t.name, description: t.description, items: parseItems(t.items) }));
}

export async function recentSubmissions(area: string, residentId?: string) {
  const rows = await prisma.checklistSubmission.findMany({
    where: { area, ...(residentId ? { residentId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { completedBy: true, resident: true },
  });
  return rows.map((r) => ({
    id: r.id, templateName: r.templateName, templateVersion: r.templateVersion, location: r.location,
    residentName: r.resident?.name ?? null, answers: r.answers, result: r.result, notes: r.notes,
    completedBy: r.completedBy.name, createdAt: r.createdAt,
  }));
}
