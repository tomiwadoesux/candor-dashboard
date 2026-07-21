"use client";

import Link from "next/link";
import { Sparkles, LayoutGrid, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODES, useRail } from "./rail-context";

const boxes = [
  { id: MODES.DASHBOARD, label: "Dashboard", href: "/talent/overview", icon: LayoutGrid },
  { id: MODES.PROFILE, label: "Profile", href: "/talent/portfolio", icon: UserCircle2 },
];

function RailTip({ children }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-[52px] z-30 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11.5px] font-medium text-background opacity-0",
        "transition-opacity duration-100 group-hover:opacity-100 group-hover:delay-300"
      )}
    >
      {children}
    </span>
  );
}

export function TalentRail() {
  const { mode, aiOpen, toggleAi } = useRail();

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-[64px] shrink-0 flex-col items-center self-start border-r border-border bg-sidebar py-5">
      <Link
        href="/talent/overview"
        aria-label="Candor home"
        className="pressable grid h-8 w-8 place-items-center rounded-[10px] bg-brand text-[15px] font-semibold text-brand-foreground"
      >
        C
      </Link>

      <nav className="mt-6 flex flex-col items-center gap-2">
        {boxes.map((b) => {
          const active = mode === b.id;
          const Icon = b.icon;
          return (
            <Link
              key={b.id}
              href={b.href}
              aria-label={b.label}
              aria-current={active ? "true" : undefined}
              className={cn(
                "nav-item group relative flex h-10 w-10 items-center justify-center rounded-xl",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <Icon className="h-[17px] w-[17px]" />
              <RailTip>{b.label}</RailTip>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          onClick={toggleAi}
          aria-label="Ask Candor"
          aria-pressed={aiOpen}
          className={cn(
            "nav-item group relative flex h-10 w-10 items-center justify-center rounded-xl",
            aiOpen
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground hover:bg-brand hover:text-brand-foreground"
          )}
        >
          <Sparkles className="h-[17px] w-[17px]" />
          <RailTip>Ask Candor</RailTip>
        </button>
      </div>
    </aside>
  );
}
