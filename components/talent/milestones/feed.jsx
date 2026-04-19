"use client";

import { useMemo } from "react";
import { Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const NOW = new Date("2026-04-18T20:00:00");

function relativeTime(iso) {
  const then = new Date(iso);
  const diff = NOW - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return then.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function workTypeFromBooking(title = "") {
  const lower = title.toLowerCase();
  if (lower.includes("runway")) return "runway show";
  if (lower.includes("editorial")) return "editorial";
  if (lower.includes("commercial") || lower.includes("tvc")) return "commercial campaign";
  if (lower.includes("campaign")) return "campaign";
  return "booking";
}

function locationFromBooking(title = "") {
  if (title.toLowerCase().includes("lagos")) return "Lagos";
  if (title.toLowerCase().includes("london")) return "London";
  return null;
}

function buildLine(m) {
  if (m.visibility === "named") {
    return {
      lead: m.talentName,
      rest: `${m.verb || "just landed"} ${workTypeFromBooking(m.bookingTitle)}${
        locationFromBooking(m.bookingTitle) ? ` in ${locationFromBooking(m.bookingTitle)}` : ""
      }.`,
    };
  }
  return {
    lead: null,
    rest: `A Candor talent just landed a ${workTypeFromBooking(m.bookingTitle)}${
      locationFromBooking(m.bookingTitle) ? ` in ${locationFromBooking(m.bookingTitle)}` : ""
    }.`,
  };
}

export function MilestonesFeed({ milestones }) {
  const approved = useMemo(
    () =>
      milestones
        .filter((m) => m.approved)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [milestones]
  );

  return (
    <div className="max-w-[880px]">
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-surface-muted/60 px-4 py-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          When a booking is confirmed, we ask if you'd like to share it here. Your name
          shows only if you say <em>yes, share my name</em>. No comments, no likes — just
          quiet wins.
        </p>
      </div>

      <ol className="relative">
        {approved.map((m, i) => {
          const line = buildLine(m);
          const isNamed = m.visibility === "named";

          return (
            <li
              key={m.id}
              className={cn(
                "group relative py-8",
                i !== 0 && "border-t border-border"
              )}
            >
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  {isNamed ? (
                    <div className="polaroid rotate-[-4deg] flex h-[72px] w-[58px] items-center justify-center transition-transform duration-300 group-hover:rotate-[-1deg] group-hover:scale-[1.03]">
                      <span className="absolute inset-1 bottom-6 rounded-[2px] bg-gradient-to-br from-primary/30 via-chart-2/20 to-chart-5/30" />
                      <span className="relative z-10 font-serif text-[14px] italic text-foreground/80">
                        {m.talentName?.[0]}
                      </span>
                    </div>
                  ) : (
                    <div className="flex h-[72px] w-[58px] items-center justify-center rounded-md border border-dashed border-border bg-surface-muted">
                      <Sparkles className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="font-serif text-[24px] font-light leading-[1.2] tracking-[-0.015em] text-foreground">
                    {line.lead && (
                      <span className="editorial-italic">{line.lead} </span>
                    )}
                    {line.rest}
                  </p>

                  <div className="mt-3 flex items-center gap-2.5 text-[11px]">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium uppercase tracking-[0.1em]",
                        isNamed
                          ? "bg-foreground text-background"
                          : "border border-border text-muted-foreground"
                      )}
                    >
                      {isNamed ? "Named" : "Anonymous"}
                    </span>
                    <span className="text-muted-foreground/80">
                      {relativeTime(m.createdAt)}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="truncate text-muted-foreground">
                      {workTypeFromBooking(m.bookingTitle)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {approved.length === 0 && (
          <li className="py-16 text-center">
            <p className="font-serif text-[20px] italic text-muted-foreground">
              Still quiet here.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              New milestones appear as bookings land and talent opt in.
            </p>
          </li>
        )}
      </ol>

      <div className="mt-14 border-t border-border pt-6">
        <p className="font-serif text-[12px] italic text-muted-foreground">
          Candor Milestones · read-only · celebrating the roster since 2020
        </p>
      </div>
    </div>
  );
}
