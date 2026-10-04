import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";
import { AddStaffForm } from "@/components/AddStaffForm";
import { StaffActions } from "@/components/StaffActions";
import { StaffCard } from "@/components/StaffCard";

export default async function AdminStaffPage() {
  const session = await getServerSession(authOptions);
  if (!canManageStaff(session!.user.role)) redirect("/dashboard");

  const staff = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });
  const activeCount = staff.filter((s) => s.active).length;

  return (
    <div>
      <Link href="/dashboard/admin" className="mb-3 inline-block text-sm font-medium text-ink-600 hover:text-brand-600">← Admin</Link>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Staff accounts</h1>
        <p className="mt-1 text-sm text-ink-600">{activeCount} active · {staff.length - activeCount} removed</p>
      </div>
      <div className="mb-6">
        <AddStaffForm />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {staff.map((s) => (
          <StaffCard key={s.id} name={s.name} username={s.username} role={s.role} active={s.active}>
            <StaffActions id={s.id} name={s.name} active={s.active} isSelf={s.id === session!.user.id} />
          </StaffCard>
        ))}
      </div>
    </div>
  );
}
