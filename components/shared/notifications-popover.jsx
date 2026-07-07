"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";

function kindDot(kind) {
  switch (kind) {
    case "payment_update":
      return "bg-success";
    case "general":
    case "announcement":
      return "bg-bronze";
    case "booking_update":
    case "availability_check":
    case "pre_job_brief":
      return "bg-warning";
    default:
      return "bg-muted-foreground";
  }
}

/**
 * Presentational notifications popover. Pass `items` as plain objects:
 * { id, title, body, createdAt, type, isRead }. No data fetching here —
 * callers own the data source.
 */
export function NotificationsPopover({ trigger, items = [] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={wrapRef}>
      {trigger ? (
        trigger({ unread, open, onClick: () => setOpen((v) => !v) })
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Notifications"
          aria-expanded={open}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface hover:text-foreground"
        >
          <Bell className="h-3.5 w-3.5" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[360px] overflow-hidden rounded-lg border border-border bg-background shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[15px] italic text-foreground">
                Notifications
              </span>
              {unread > 0 && (
                <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {unread} new
                </span>
              )}
            </div>
          </div>

          <ul className="max-h-[420px] overflow-y-auto divide-y divide-border/60">
            {items.length === 0 && (
              <li className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                No notifications yet.
              </li>
            )}
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-3 py-3 transition-colors hover:bg-surface-muted/50",
                  !n.isRead && "bg-primary/[0.035]"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    kindDot(n.type)
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate text-[12.5px] font-medium text-foreground">
                      {n.title}
                    </div>
                    <div className="shrink-0 font-mono text-[10px] text-muted-foreground/70">
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
                    {n.body}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
