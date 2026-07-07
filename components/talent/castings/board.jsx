"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Award,
  Check,
  Clock,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dateShort, relativeTime, statusLabel } from "@/lib/format";
import { expressInterest, withdrawInterest } from "@/lib/actions/castings";

function shootDates(c) {
  if (!c.shoot_date_end || c.shoot_date_end === c.shoot_date_start) {
    return dateShort(c.shoot_date_start);
  }
  return `${dateShort(c.shoot_date_start)} – ${dateShort(c.shoot_date_end)}`;
}

function CastingCard({ casting: c, index }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [conflictNotice, setConflictNotice] = useState(false);

  const closed = new Date(c.deadline) < new Date();
  const response = c.myInterest?.response ?? null;
  const shortlisted = Boolean(c.myInterest?.shortlisted);
  const selected = Boolean(c.myInterest?.selected);
  const locked = shortlisted || selected;
  const conflict = Boolean(c.myInterest?.calendar_conflict) || conflictNotice;

  const act = (fn) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.calendarConflict) setConflictNotice(true);
    });
  };

  return (
    <li
      className={cn(
        "group relative border-b border-border py-8",
        closed && "opacity-60"
      )}
    >
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-2">
          <div
            data-slot="numeric"
            className="font-serif text-[34px] font-light leading-none tracking-[-0.02em] text-foreground/40"
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
              closed
                ? "bg-muted text-muted-foreground"
                : "bg-surface-muted text-muted-foreground"
            )}
          >
            <Clock className="h-3 w-3" />
            {closed ? "Closed" : `Closes ${relativeTime(c.deadline)}`}
          </div>
          {(shortlisted || selected) && (
            <div className="mt-3 flex flex-col items-start gap-1.5">
              {selected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10.5px] font-medium text-success">
                  <Award className="h-3 w-3" /> Selected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-bronze/10 px-2 py-0.5 text-[10.5px] font-medium text-bronze">
                  <Star className="h-3 w-3" /> Shortlisted
                </span>
              )}
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-7">
          <h3 className="font-serif text-[24px] font-light leading-[1.15] tracking-[-0.02em] text-foreground">
            <span className="editorial-italic">{c.title}</span>
          </h3>
          <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
            {[c.work_type, statusLabel(c.category), statusLabel(c.location)]
              .filter(Boolean)
              .join(" · ")}
          </div>

          {c.description && (
            <p className="mt-4 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
              {c.description}
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12px]">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                Shoot dates
              </dt>
              <dd className="mt-0.5 text-foreground">{shootDates(c)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                Location
              </dt>
              <dd className="mt-0.5 inline-flex items-center gap-1 text-foreground">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {statusLabel(c.location)}
              </dd>
            </div>
            {c.requirements && (
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                  Requirements
                </dt>
                <dd className="mt-0.5 text-foreground">{c.requirements}</dd>
              </div>
            )}
            {c.media_usage && (
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                  Usage
                </dt>
                <dd className="mt-0.5 text-foreground">{c.media_usage}</dd>
              </div>
            )}
          </dl>

          {conflict && (
            <div className="mt-5 inline-flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-[11.5px] text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Calendar conflict
                {c.myInterest?.conflict_details
                  ? ` · ${c.myInterest.conflict_details}`
                  : " · this overlaps one of your bookings. Your booker has been flagged."}
              </span>
            </div>
          )}

          {error && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>

        <div className="col-span-12 flex items-start justify-end md:col-span-3">
          {response === "interested" ? (
            <div className="flex flex-col items-end gap-2">
              <span className="slide-up-in inline-flex items-center gap-2 rounded-full bg-success/10 px-3.5 py-2 text-[12px] font-medium text-success">
                <Check className="h-3.5 w-3.5" />
                Interest submitted
              </span>
              {!locked && !closed && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => act(() => withdrawInterest(c.id))}
                  className="pressable inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  {pending ? "Withdrawing…" : "Withdraw"}
                </button>
              )}
            </div>
          ) : response === "not_available" ? (
            <div className="flex flex-col items-end gap-2">
              <span className="slide-up-in inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-[12px] font-medium text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Marked unavailable
              </span>
              {!locked && !closed && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => act(() => expressInterest(c.id, "interested"))}
                  className="pressable inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {pending ? "Saving…" : "Changed your mind? I'm interested"}
                </button>
              )}
            </div>
          ) : closed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground">
              Closed
            </span>
          ) : (
            <div className="flex flex-col items-stretch gap-2 md:w-full">
              <button
                type="button"
                disabled={pending}
                onClick={() => act(() => expressInterest(c.id, "interested"))}
                className="pressable inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-[12.5px] font-medium text-background transition-transform duration-150 hover:-translate-y-[1px] disabled:opacity-60"
              >
                {pending ? "Saving…" : "I'm interested"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => act(() => expressInterest(c.id, "not_available"))}
                className="pressable inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-60"
              >
                Not available
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function CastingBoard({ castings }) {
  return (
    <div className="max-w-[1180px]">
      <ol className="border-t border-border">
        {castings.map((c, idx) => (
          <CastingCard key={c.id} casting={c} index={idx} />
        ))}

        {castings.length === 0 && (
          <li className="py-16 text-center">
            <p className="font-serif text-[18px] italic text-muted-foreground">
              Nothing open right now.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              New briefs arrive as clients send them in.
            </p>
          </li>
        )}
      </ol>
    </div>
  );
}
