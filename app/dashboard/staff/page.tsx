import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";
import { AddStaffForm } from "@/components/AddStaffForm";
import { StaffActions } from "@/components/StaffActions";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_STYLES: Record<string, string> = {
  MANAGER: "bg-coral-50 text-coral-700",
  SENIOR_CARER: "bg-amber-50 text-amber-700",
  CARER: "bg-ink-700/10 text-ink-700",
};

export default async function StaffPage() {
  const session = await getServerSession(authOptions);
  if (!canManageStaff(session!.user.role)) redirect("/dashboard");

  const staff = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Staff</h1>
          <p className="mt-1 text-sm text-ink-600">{staff.length} accounts</p>
        </div>
        <AddStaffForm />
      </div>

      <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
        {staff.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 border-b border-ink-700/10 px-5 py-4 last:border-b-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-700/10 text-xs font-semibold text-ink-700">
              {initials(s.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink-800">
                {s.name}
                {!s.active && <span className="ml-2 text-xs font-normal text-ink-600">(inactive)</span>}
              </p>
              <p className="truncate text-sm text-ink-600">{s.email}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                ROLE_STYLES[s.role] ?? ROLE_STYLES.CARER
              }`}
            >
              {s.role.replace("_", " ")}
            </span>
            <StaffActions id={s.id} active={s.active} isSelf={s.id === session!.user.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
