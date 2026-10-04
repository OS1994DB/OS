import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageResidents } from "@/lib/permissions";
import { AddResidentForm } from "@/components/AddResidentForm";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ResidentsPage() {
  const session = await getServerSession(authOptions);
  const residents = await prisma.resident.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Residents</h1>
          <p className="mt-1 text-sm text-ink-600">{residents.length} residents at Westcliff Lodge</p>
        </div>
        {canManageResidents(session!.user.role) && <AddResidentForm />}
      </div>

      {residents.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-12 text-center">
          <p className="text-sm text-ink-600">No residents yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {residents.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/residents/${r.id}`}
              className="group flex flex-col items-center rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 font-display text-lg font-semibold text-brand-700">
                {initials(r.name)}
              </div>
              <p className="mt-3 font-display font-semibold text-ink-800">{r.name}</p>
              <p className="mt-0.5 text-sm text-ink-600">Room {r.roomNumber}</p>
              <p className="mt-1 truncate text-xs text-ink-600/70">{r.keyContactName}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
