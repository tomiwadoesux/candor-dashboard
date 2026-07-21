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

function CastingCard({ casting: c }) {
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
        "card-hover rounded-2xl border border-border bg-card p-5",
        closed && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                closed
                  ? "bg-muted text-muted-foreground"
                  : "bg-brand-soft text-brand-soft-foreground"
              )}
            >
              <Clock className="h-3 w-3" />
              {closed ? "Closed" : `Closes ${relativeTime(c.deadline)}`}
            </span>
            {selected && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <Award className="h-3 w-3" /> Selected
              </span>
            )}
            {shortlisted && !selected && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                <Star className="h-3 w-3" /> Shortlisted
              </span>
            )}
          </div>

          <h3 className="mt-2.5 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
            {c.title}
          </h3>
          <div className="mt-1 text-[12px] text-muted-foreground">
            {[c.work_type, statusLabel(c.category), statusLabel(c.location)]
              .filter(Boolean)
              .join(" · ")}
          </div>

          {c.description && (
            <p className="mt-3 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
              {c.description}
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px] md:grid-cols-4">
            <div>
              <dt className="text-[11.5px] text-muted-foreground">Shoot dates</dt>
              <dd className="mt-0.5 font-medium text-foreground">{shootDates(c)}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] text-muted-foreground">Location</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1 font-medium text-foreground">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {statusLabel(c.location)}
              </dd>
            </div>
            {c.requirements && (
              <div>
                <dt className="text-[11.5px] text-muted-foreground">Requirements</dt>
                <dd className="mt-0.5 font-medium text-foreground">{c.requirements}</dd>
              </div>
            )}
            {c.media_usage && (
              <div>
                <dt className="text-[11.5px] text-muted-foreground">Usage</dt>
                <dd className="mt-0.5 font-medium text-foreground">{c.media_usage}</dd>
              </div>
            )}
          </dl>

          {conflict && (
            <div className="mt-4 inline-flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-[12px] text-warning">
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
            <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {response === "interested" ? (
            <>
              <span className="slide-up-in inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[12px] font-medium text-success">
                <Check className="h-3.5 w-3.5" />
                Interest submitted
              </span>
              {!locked && !closed && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => act(() => withdrawInterest(c.id))}
                  className="pressable inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  {pending ? "Withdrawing…" : "Withdraw"}
                </button>
              )}
            </>
          ) : response === "not_available" ? (
            <>
              <span className="slide-up-in inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Marked unavailable
              </span>
              {!locked && !closed && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => act(() => expressInterest(c.id, "interested"))}
                  className="pressable text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {pending ? "Saving…" : "Actually, I'm interested"}
                </button>
              )}
            </>
          ) : closed ? null : (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => act(() => expressInterest(c.id, "interested"))}
                className="pressable inline-flex h-9 w-36 items-center justify-center rounded-lg bg-brand text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                {pending ? "Saving…" : "I'm interested"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => act(() => expressInterest(c.id, "not_available"))}
                className="pressable inline-flex h-9 w-36 items-center justify-center rounded-lg border border-border bg-surface text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-60"
              >
                Not available
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export function CastingBoard({ castings }) {
  return (
    <ol className="stagger-in space-y-4">
      {castings.map((c) => (
        <CastingCard key={c.id} casting={c} />
      ))}

      {castings.length === 0 && (
        <li className="rounded-2xl border border-dashed border-border bg-surface-muted/40 py-14 text-center">
          <p className="text-[14px] font-medium text-foreground">
            Nothing open right now
          </p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            New briefs arrive as clients send them in.
          </p>
        </li>
      )}
    </ol>
  );
}
