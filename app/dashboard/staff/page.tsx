import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";
import { StaffCard } from "@/components/StaffCard";

export default async function StaffPage() {
  const session = await getServerSession(authOptions);
  if (!canManageStaff(session!.user.role)) redirect("/dashboard");

  const staff = await prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Staff</h1>
        <p className="mt-1 text-sm text-ink-600">
          {staff.length} active staff · to add or remove accounts go to{" "}
          <Link href="/dashboard/admin/staff" className="text-brand-700 hover:underline">Admin → Staff accounts</Link>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {staff.map((s) => (
          <StaffCard key={s.id} name={s.name} username={s.username} role={s.role} />
        ))}
      </div>
    </div>
  );
}
