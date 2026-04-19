"use client";

import { Sparkles, LayoutGrid, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODES, useRail } from "./rail-context";

const boxes = [
  {
    id: "ai",
    label: "Ask Candor",
    hint: "AI",
    icon: Sparkles,
  },
  {
    id: MODES.DASHBOARD,
    label: "Dashboard",
    hint: "Your work + community",
    icon: LayoutGrid,
  },
  {
    id: MODES.PROFILE,
    label: "Profile",
    hint: "Portfolio + roster",
    icon: UserCircle2,
  },
];

export function TalentRail() {
  const { mode, setMode, aiOpen, toggleAi } = useRail();

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-[68px] shrink-0 flex-col items-center gap-3 self-start border-r border-border bg-surface-muted/40 py-5">
      <div className="flex h-10 w-10 items-center justify-center">
        <span className="font-serif text-[22px] font-light italic tracking-[-0.04em] text-primary">
          C
        </span>
      </div>

      <div className="mt-2 flex flex-col items-center gap-2.5">
        {boxes.map((b) => {
          const isAi = b.id === "ai";
          const active = isAi ? aiOpen : mode === b.id;
          const Icon = b.icon;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => (isAi ? toggleAi() : setMode(b.id))}
              aria-label={b.label}
              aria-pressed={active}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-[12px] transition-[background-color,color,transform] duration-200 ease-[var(--ease-smooth)]",
                "text-muted-foreground hover:text-foreground",
                active
                  ? "bg-foreground text-background shadow-[var(--shadow-lift)]"
                  : "hover:bg-surface"
              )}
            >
              <Icon className={cn("h-[17px] w-[17px] transition-transform", active && "scale-105")} />

              {isAi && !active && (
                <span
                  aria-hidden
                  className="absolute right-1 top-1 flex h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}

              <span
                aria-hidden
                className={cn(
                  "absolute left-[52px] z-30 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-[var(--shadow-lift)] transition-opacity duration-150",
                  "pointer-events-none group-hover:opacity-100"
                )}
              >
                {b.label}
                <span className="ml-1.5 text-background/60">· {b.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
