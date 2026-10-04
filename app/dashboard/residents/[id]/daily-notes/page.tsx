import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResidentSubpageHeader } from "@/components/ResidentSubpageHeader";
import { AddNoteForm } from "@/components/AddNoteForm";
import { NoteBadge } from "@/components/NoteBadge";

export default async function DailyNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) notFound();

  const notes = await prisma.note.findMany({
    where: { residentId: id },
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 200,
  });

  return (
    <div>
      <ResidentSubpageHeader residentId={resident.id} residentName={resident.name} title="Daily notes" />
      <AddNoteForm residentId={resident.id} />

      {notes.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
          <p className="text-sm text-ink-600">No notes yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between gap-2">
                <NoteBadge category={note.category} />
                <span className="text-xs text-ink-600">
                  {note.author.name} · {note.createdAt.toLocaleString("en-GB")}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-ink-700">{note.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
