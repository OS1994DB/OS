import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BackLink } from "@/components/BackLink";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";

export default async function AuditLogPage() {
  const session = await getServerSession(authOptions);
  if (!canManageStaff(session!.user.role)) redirect("/dashboard");
  const audit = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: true } });

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Admin" />
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Audit log</h1>
      <p className="mb-6 mt-1 text-sm text-ink-600">Latest 200 actions: who did what, and when</p>
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
