import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";
import { SignOutButton } from "@/components/SignOutButton";
import { SidebarNav } from "@/components/SidebarNav";

function roleLabel(role: string) {
  return role.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user.role ?? "CARER";
  const name = session?.user.name ?? "";

  let unreadMessages = 0;
  if (session?.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastMessagesSeenAt: true },
    });
    unreadMessages = await prisma.staffMessage.count({
      where: { createdAt: { gt: user?.lastMessagesSeenAt ?? new Date(0) } },
    });
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden print:!hidden w-64 flex-col border-r border-ink-700/10 bg-cream-100 lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-500 to-brand-900 font-display text-base font-bold text-white shadow-sm">
            W
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-ink-800">Westcliff Lodge</p>
            <p className="text-xs uppercase tracking-wide text-ink-600">Operating System</p>
          </div>
        </div>

        <SidebarNav showStaff={canManageStaff(role)} variant="sidebar" unreadMessages={unreadMessages} />

        <div className="mt-auto border-t border-ink-700/10 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
              {initials(name)}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-ink-800">{name}</p>
              <p className="text-xs text-ink-600">{roleLabel(role)}</p>
            </div>
          </div>
          <SignOutButton variant="light" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 print:hidden border-b border-ink-700/10 bg-cream-50/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-900 font-display text-xs font-bold text-white">
              W
            </div>
            <span className="font-display text-sm font-semibold text-ink-800">Westcliff Lodge</span>
          </div>
          <SignOutButton variant="light" />
        </div>
        <div className="border-t border-ink-700/10 px-3 py-2">
          <SidebarNav showStaff={canManageStaff(role)} variant="topbar" unreadMessages={unreadMessages} />
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:pl-72 lg:pr-8 print:!p-0">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
