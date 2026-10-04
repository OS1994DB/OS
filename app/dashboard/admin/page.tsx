import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!canManageStaff(session!.user.role)) redirect("/dashboard");

  const [residents, activeStaff, inactiveStaff, openIncidents, notes, audit] = await Promise.all([
    prisma.resident.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.user.count({ where: { active: false } }),
    prisma.incident.count({ where: { status: "OPEN" } }),
    prisma.note.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: true } }),
  ]);

  const stats = [
    ["Residents", residents],
    ["Active staff", activeStaff],
    ["Inactive staff", inactiveStaff],
    ["Open incidents", openIncidents],
    ["Daily notes", notes],
  ] as const;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Admin</h1>
          <p className="mt-1 text-sm text-ink-600">Managers only</p>
        </div>
        <Link href="/dashboard/staff" className="btn-primary">Manage staff accounts</Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
            <p className="text-2xl font-semibold text-ink-800">{n}</p>
            <p className="text-xs text-ink-600">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 font-display text-base font-semibold text-ink-800">Audit log (latest 100)</h2>
      <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
        {audit.map((a) => (
          <li key={a.id} className="flex flex-wrap gap-x-3 border-b border-ink-700/10 px-4 py-2 text-sm last:border-b-0">
            <span className="text-xs text-ink-600">{a.createdAt.toLocaleString("en-GB")}</span>
            <span className="font-medium text-ink-800">{a.user.name}</span>
            <span className="text-ink-700">{a.action}</span>
            <span className="text-xs text-ink-600">{a.entityType}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
