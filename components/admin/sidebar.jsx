"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, PanelLeftClose, PanelLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { useSidebar } from "./sidebar-context";
import { CommandPalette } from "./command-palette";
import { NAV_SECTIONS } from "./nav-config";

const ROLE_LABELS = {
  booker: "Booker",
  md: "Managing Director",
  ceo: "Chief Executive",
};

export function AdminSidebar({ profile }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <>
      <aside
        data-collapsed={collapsed}
        className={cn(
          "group/sidebar sticky top-0 z-30 flex h-screen shrink-0 flex-col self-start border-r border-border bg-sidebar",
          "transition-[width] duration-200 ease-[var(--ease-out)]",
          collapsed ? "w-[64px]" : "w-[240px]"
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
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-brand text-[13px] font-semibold text-brand-foreground">
              C
            </span>
            {!collapsed && (
              <span className="text-[13.5px] font-semibold tracking-[-0.01em]">
                Candor
              </span>
            )}
          </Link>

          {!collapsed && (
            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <Sun
                    className={cn(
                      "absolute h-3.5 w-3.5 transition-[transform,opacity] duration-200 ease-out",
                      theme === "dark"
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                    )}
                  />
                  <Moon
                    className={cn(
                      "absolute h-3.5 w-3.5 transition-[transform,opacity] duration-200 ease-out",
                      theme === "dark"
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
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
              {theme === "dark" ? (
                <Moon className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        <div className="px-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "flex h-8 w-full items-center gap-2 rounded-lg border border-border bg-surface px-2 text-xs text-muted-foreground transition-colors hover:border-border-strong",
              collapsed && "justify-center border-transparent bg-transparent px-0 hover:bg-sidebar-accent"
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Search</span>
                <kbd className="flex h-5 items-center rounded-[5px] border border-border bg-surface-muted px-1.5 font-mono text-[10px] text-muted-foreground/80">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-5 [scrollbar-gutter:stable]">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.label} className={cn(sIdx > 0 && "mt-5")}>
              {!collapsed && (
                <div className="mb-1.5 px-2 text-[11px] font-medium text-muted-foreground/70">
                  {section.label}
                </div>
              )}
              <ul className="flex flex-col gap-px">
                {section.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        data-active={active}
                        className={cn(
                          "nav-item group/item relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] text-muted-foreground outline-hidden",
                          "hover:bg-sidebar-accent hover:text-foreground",
                          "focus-visible:ring-2 focus-visible:ring-ring",
                          active && "bg-sidebar-accent font-medium text-foreground",
                          collapsed && "justify-center px-0"
                        )}
                        title={collapsed ? item.title : undefined}
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
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground/80 group-hover/item:text-foreground"
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.title}</span>}
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
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-muted text-[11px] font-medium ring-1 ring-border">
              {(profile?.full_name || "C A")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-foreground">
                  {profile?.full_name || "Candor Admin"}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {ROLE_LABELS[profile?.role] || "Team"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </>
  );
}
