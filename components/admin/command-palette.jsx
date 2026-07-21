"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, QUICK_ACTIONS } from "./nav-config";

const ALL_ITEMS = [
  ...NAV_SECTIONS.flatMap((s) =>
    s.items.map((i) => ({ ...i, group: s.label }))
  ),
  ...QUICK_ACTIONS.map((a) => ({ ...a, group: "Actions" })),
];

// ⌘K navigation. Keyboard-initiated and used constantly, so it opens
// instantly — no entry animation. Mount it only while open; a fresh mount
// starts with a clean query, no reset effects needed.
export function CommandPalette({ onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rawIndex, setRawIndex] = useState(0);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ITEMS;
    return ALL_ITEMS.filter((i) => i.title.toLowerCase().includes(q));
  }, [query]);

  const index = Math.min(rawIndex, Math.max(0, results.length - 1));

  useEffect(() => {
    const el = listRef.current?.children?.[index];
    el?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const go = (item) => {
    onClose();
    router.push(item.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/50 pt-[18vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-[min(560px,calc(100vw-32px))] overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setRawIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setRawIndex(Math.min(results.length - 1, index + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setRawIndex(Math.max(0, index - 1));
              } else if (e.key === "Enter" && results[index]) {
                e.preventDefault();
                go(results[index]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Where to?"
            className="h-12 flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <kbd className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
            esc
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[320px] overflow-y-auto p-1.5">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-[12.5px] text-muted-foreground">
              Nothing matches &ldquo;{query}&rdquo;
            </li>
          )}
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <li key={`${item.group}-${item.href}-${item.title}`}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  onMouseMove={() => setRawIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px]",
                    i === index
                      ? "bg-surface-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {Icon ? (
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  )}
                  <span className="flex-1">{item.title}</span>
                  <span className="text-[11px] text-muted-foreground/50">
                    {item.group}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
