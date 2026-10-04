import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";
import { StaffIcon, AssessmentIcon, NoteIcon } from "@/components/icons";

function AdminTile({ href, icon, title, sub }: { href: string; icon: ReactNode; title: string; sub: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center rounded-xl2 border border-ink-700/10 bg-cream-100 p-5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700 [&>svg]:h-7 [&>svg]:w-7">
        {icon}
      </div>
      <p className="mt-3 font-display font-semibold text-ink-800">{title}</p>
      <p className="mt-0.5 text-sm text-ink-600">{sub}</p>
    </Link>
  );
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!canManageStaff(session!.user.role)) redirect("/dashboard");

  const dayAgo = new Date(Date.now() - 86_400_000);
  const [activeStaff, removedStaff, templates, activeTemplates, audit24h, openIncidents] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.user.count({ where: { active: false } }),
    prisma.checklistTemplate.count(),
    prisma.checklistTemplate.count({ where: { active: true } }),
    prisma.auditLog.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.incident.count({ where: { status: "OPEN" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Admin</h1>
        <p className="mt-1 text-sm text-ink-600">Managers only · {openIncidents} open incident{openIncidents === 1 ? "" : "s"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AdminTile
          href="/dashboard/admin/staff"
          icon={<StaffIcon />}
          title="Staff accounts"
          sub={`${activeStaff} active${removedStaff ? ` · ${removedStaff} removed` : ""}`}
        />
        <AdminTile
          href="/dashboard/admin/templates"
          icon={<AssessmentIcon />}
          title="Templates"
          sub={`${activeTemplates} active of ${templates}`}
        />
        <AdminTile
          href="/dashboard/admin/audit-log"
          icon={<NoteIcon />}
          title="Audit log"
          sub={`${audit24h} actions in 24h`}
        />
      </div>
    </div>
  );
}
