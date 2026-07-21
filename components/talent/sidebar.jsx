"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarCheck,
  Wallet,
  MessagesSquare,
  FileText,
  CalendarDays,
  Clapperboard,
  Trophy,
  Camera,
  Users,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MODES, useRail } from "./rail-context";

const DASHBOARD_NAV = [
  {
    items: [
      { title: "Overview", href: "/talent/overview", icon: Home, exact: true },
      { title: "Bookings", href: "/talent/bookings", icon: CalendarCheck },
      { title: "Payments", href: "/talent/payments", icon: Wallet },
      {
        title: "Messages",
        href: "/talent/communications",
        icon: MessagesSquare,
        unreadBadge: true,
      },
      { title: "Documents", href: "/talent/documents", icon: FileText },
      { title: "Calendar", href: "/talent/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "Casting board", href: "/talent/castings", icon: Clapperboard },
      { title: "Milestones", href: "/talent/milestones", icon: Trophy },
    ],
  },
];

const PROFILE_NAV = [
  {
    items: [
      { title: "Portfolio", href: "/talent/portfolio", icon: Camera, exact: true },
      { title: "Directory", href: "/talent/directory", icon: Users },
    ],
  },
];

const SPEC = {
  [MODES.DASHBOARD]: { title: "Dashboard", sections: DASHBOARD_NAV },
  [MODES.PROFILE]: { title: "Profile", sections: PROFILE_NAV },
};

export function TalentSidebar({ unread = 0 }) {
  const pathname = usePathname();
  const { mode } = useRail();
  const spec = SPEC[mode] || SPEC[MODES.DASHBOARD];

  const isActive = (item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[216px] shrink-0 flex-col self-start border-r border-border bg-sidebar">
      <div className="px-5 pb-3 pt-6">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {spec.title}
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 [scrollbar-gutter:stable]">
        {spec.sections.map((section, sIdx) => (
          <div key={sIdx} className={cn(sIdx > 0 && "mt-6")}>
            {section.label && (
              <div className="mb-1.5 px-2 text-[11.5px] font-medium text-muted-foreground/70">
                {section.label}
              </div>
            )}
            <ul className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = isActive(item);
                const badge = item.unreadBadge && unread > 0 ? unread : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-active={active}
                      className={cn(
                        "nav-item group/item relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground outline-hidden",
                        "hover:bg-sidebar-accent hover:text-foreground",
                        active && "bg-sidebar-accent font-medium text-foreground"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-[-12px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-brand transition-[opacity,transform] duration-200",
                          active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                        )}
                      />
                      <item.icon
                        className={cn(
                          "h-[15px] w-[15px] shrink-0 transition-colors",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground/70 group-hover/item:text-foreground"
                        )}
                      />
                      <span className="flex-1 truncate">{item.title}</span>
                      {badge ? (
                        <span
                          data-slot="numeric"
                          className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10.5px] font-medium text-brand-foreground"
                        >
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <a
          href="mailto:bookings@candormanagement.com"
          className="group flex items-center gap-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">bookings@candormanagement.com</span>
        </a>
      </div>
    </aside>
  );
}
