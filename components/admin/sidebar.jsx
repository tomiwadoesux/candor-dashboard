"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clapperboard,
  MessageSquare,
  Receipt,
  FileText,
  Award,
  BarChart3,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Search,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { useSidebar } from "./sidebar-context";

const sections = [
  {
    label: "Operations",
    items: [
      { title: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
      { title: "Talent roster", href: "/admin/talent", icon: Users },
      { title: "Clients", href: "/admin/clients", icon: Building2 },
      { title: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { title: "Casting board", href: "/admin/casting", icon: Clapperboard },
    ],
  },
  {
    label: "Communications",
    items: [
      {
        title: "Communications",
        href: "/admin/communications",
        icon: MessageSquare,
        badge: 3,
      },
      { title: "Community feed", href: "/admin/community", icon: Megaphone },
      { title: "Documents", href: "/admin/documents", icon: FileText },
      { title: "Milestones", href: "/admin/milestones", icon: Award, badge: 2 },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Payments & invoicing", href: "/admin/invoicing", icon: Receipt },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "group/sidebar sticky top-0 z-30 flex h-screen shrink-0 flex-col self-start border-r border-border bg-sidebar",
        "transition-[width] duration-300 ease-[var(--ease-smooth)]",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors hover:bg-sidebar-accent",
            collapsed && "w-full justify-center px-0"
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-sink)]">
            C
          </span>
          {!collapsed && (
            <span className="text-[13.5px] font-medium tracking-[-0.01em]">
              Candor<span className="text-muted-foreground/70"> · Admin</span>
            </span>
          )}
        </Link>

        {!collapsed && (
          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <Sun
                  className={cn(
                    "absolute h-3.5 w-3.5 transition-all duration-300",
                    theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  )}
                />
                <Moon
                  className={cn(
                    "absolute h-3.5 w-3.5 transition-all duration-300",
                    theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  )}
                />
              </span>
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <div className="flex flex-col items-center gap-0.5 px-2 pb-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}

      <div className="px-3">
        <button
          type="button"
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-md border border-border bg-surface-muted px-2 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search</span>
              <kbd className="flex h-5 items-center rounded-[4px] border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground/80">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-4 [scrollbar-gutter:stable]">
        {sections.map((section, sIdx) => (
          <div key={section.label} className={cn(sIdx > 0 && "mt-5")}>
            {!collapsed && (
              <div className="mb-1.5 px-2 text-[10.5px] font-medium uppercase tracking-[0.09em] text-muted-foreground/70">
                {section.label}
              </div>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-active={active}
                      className={cn(
                        "nav-item group/item relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-normal text-muted-foreground outline-hidden",
                        "hover:bg-sidebar-accent hover:text-foreground",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        active && "bg-sidebar-accent text-foreground font-medium",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary transition-[opacity,transform] duration-200",
                          active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                        )}
                      />
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-foreground" : "text-muted-foreground/80 group-hover/item:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.title}</span>
                          {item.badge ? (
                            <span
                              data-slot="numeric"
                              className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-medium text-primary"
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md px-1.5 py-1",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-medium ring-1 ring-border">
            AO
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar dot-pulse"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate font-serif text-[13px] italic text-foreground">
                Adaora
              </div>
              <div className="truncate text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
                Talent Director
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
