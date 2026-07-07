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
        title: "Communications",
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
    muted: true,
    items: [
      { title: "Casting board", href: "/talent/castings", icon: Clapperboard },
      { title: "Milestones", href: "/talent/milestones", icon: Trophy },
    ],
  },
];

const PROFILE_NAV = [
  {
    label: "You",
    items: [
      { title: "Portfolio", href: "/talent/portfolio", icon: Camera, exact: true },
    ],
  },
  {
    label: "Roster",
    items: [
      { title: "Talent directory", href: "/talent/directory", icon: Users },
    ],
  },
];

const SPEC = {
  [MODES.DASHBOARD]: {
    title: "Dashboard",
    caption: "Your work, community, and conversations.",
    sections: DASHBOARD_NAV,
  },
  [MODES.PROFILE]: {
    title: "Profile",
    caption: "Your portfolio and the Candor roster.",
    sections: PROFILE_NAV,
  },
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
    <aside
      key={mode}
      className="slide-up-in sticky top-0 z-20 flex h-screen w-[232px] shrink-0 flex-col self-start border-r border-border bg-background"
    >
      <div className="px-5 pt-6 pb-4">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
          Candor · Talent
        </div>
        <h2 className="mt-1.5 font-serif text-[22px] font-light tracking-[-0.02em] text-foreground">
          {spec.title}
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {spec.caption}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 [scrollbar-gutter:stable]">
        {spec.sections.map((section, sIdx) => (
          <div key={sIdx} className={cn(sIdx > 0 && "mt-6")}>
            {section.label && (
              <div
                className={cn(
                  "mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.12em]",
                  section.muted
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground/60"
                )}
              >
                {section.label}
              </div>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(item);
                const badge = item.unreadBadge && unread > 0 ? unread : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-active={active}
                      className={cn(
                        "nav-item group/item relative flex h-9 items-center gap-3 rounded-md px-2.5 text-[13px] text-muted-foreground outline-hidden",
                        "hover:bg-surface-muted hover:text-foreground",
                        active && "bg-surface-muted text-foreground"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-[-10px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-foreground transition-[opacity,transform] duration-200",
                          active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                        )}
                      />
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-foreground" : "text-muted-foreground/70 group-hover/item:text-foreground"
                        )}
                      />
                      <span className="flex-1 truncate">{item.title}</span>
                      {badge ? (
                        <span
                          data-slot="numeric"
                          className="flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze/10 px-1 text-[10px] font-medium text-bronze"
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

      <a
        href="mailto:bookings@candormanagement.com"
        className="group mx-4 mb-4 flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-muted"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <Mail className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            Your booking team
          </div>
          <div className="truncate font-serif text-[14px] italic leading-tight text-foreground">
            bookings@candor
          </div>
        </div>
      </a>
    </aside>
  );
}
