"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { REACTIONS } from "@/components/reactions/icons";

export function ReactionBar({ reactions = {}, actorId, onToggle, align = "left" }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function handler(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const entries = Object.entries(reactions).filter(([, arr]) => arr && arr.length);

  return (
    <div className={cn("flex items-center gap-1 text-foreground", align === "right" && "justify-end")} ref={wrapRef}>
      {entries.map(([kind, actors]) => {
        const meta = REACTIONS.find((r) => r.id === kind);
        if (!meta) return null;
        const Icon = meta.Icon;
        const mine = actors.includes(actorId);
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onToggle(kind)}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10.5px] transition-colors",
              mine
                ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
                : "border-border bg-surface-muted/60 text-muted-foreground hover:border-border-strong hover:text-foreground"
            )}
            title={meta.label}
          >
            <Icon className="h-3 w-3" />
            <span className="font-mono">{actors.length}</span>
          </button>
        );
      })}

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-label="Add reaction"
          className={cn(
            "inline-flex h-6 items-center gap-1 rounded-full border border-border/70 bg-surface-muted/40 px-1.5 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
            pickerOpen && "border-border-strong text-foreground"
          )}
        >
          <Smile className="h-3 w-3" />
          <span className="text-[10px]">+</span>
        </button>

        {pickerOpen && (
          <div
            className={cn(
              "absolute z-20 mt-1 flex items-center gap-0.5 rounded-full border border-border bg-background p-1 shadow-[var(--shadow-lift)]",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {REACTIONS.map((r) => {
              const Icon = r.Icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onToggle(r.id);
                    setPickerOpen(false);
                  }}
                  title={r.label}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
