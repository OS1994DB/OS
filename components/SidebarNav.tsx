"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon, ResidentsIcon, StaffIcon, SpeechBubbleIcon, AlertTriangleIcon, BuildingIcon, SparkleIcon, ShieldIcon, HandshakeIcon, AssessmentIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/dashboard/residents", label: "Residents", icon: ResidentsIcon, exact: false },
  { href: "/dashboard/incidents", label: "Incidents", icon: AlertTriangleIcon, exact: false },
  { href: "/dashboard/audits", label: "Audits", icon: AssessmentIcon, exact: false },
  { href: "/dashboard/site", label: "Site", icon: BuildingIcon, exact: false },
  { href: "/dashboard/housekeeping", label: "Housekeeping", icon: SparkleIcon, exact: false },
  { href: "/dashboard/ppp", label: "PPP", icon: ShieldIcon, exact: false },
  { href: "/dashboard/services", label: "Services", icon: HandshakeIcon, exact: false },
  { href: "/dashboard/chat", label: "Chat", icon: SpeechBubbleIcon, exact: false },
  { href: "/dashboard/messages", label: "Messages", icon: SpeechBubbleIcon, exact: false },
  { href: "/dashboard/staff", label: "Staff", icon: StaffIcon, exact: false, managerOnly: true },
] as const;

const LIMITED_HREFS = ["/dashboard", "/dashboard/site", "/dashboard/housekeeping", "/dashboard/ppp", "/dashboard/chat"];

export function SidebarNav({
  showStaff,
  limited = false,
  variant,
  unreadMessages = 0,
}: {
  showStaff: boolean;
  limited?: boolean;
  variant: "sidebar" | "topbar";
  unreadMessages?: number;
}) {
  const pathname = usePathname();

  const items = NAV_ITEMS.filter(
    (item) => (!("managerOnly" in item) || showStaff) && (!limited || LIMITED_HREFS.includes(item.href)),
  );

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  function badge(href: string) {
    if (href !== "/dashboard/messages" || unreadMessages === 0) return null;
    return (
      <span className="ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-coral-500 px-1 text-[11px] font-bold text-white">
        {unreadMessages > 9 ? "9+" : unreadMessages}
      </span>
    );
  }

  if (variant === "topbar") {
    return (
      <nav className="flex items-center gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl2 px-2.5 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-white/5 hover:text-ink-800"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {badge(item.href)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-white/5 hover:text-ink-800"
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
            {badge(item.href)}
          </Link>
        );
      })}
    </nav>
  );
}
