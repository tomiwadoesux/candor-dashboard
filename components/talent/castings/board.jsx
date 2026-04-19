"use client";

import { useMemo, useState } from "react";
import { Check, X, AlertTriangle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function parseRange(range) {
  if (!range) return [];
  const [start, end] = range.split(" to ");
  return end ? [start, end] : [start, start];
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) <= new Date(bEnd) && new Date(bStart) <= new Date(aEnd);
}

function formatDateRange(range) {
  const [start, end] = parseRange(range);
  const s = new Date(start);
  if (!end || start === end) {
    return s.toLocaleDateString("en", { month: "long", day: "numeric" });
  }
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${s.toLocaleDateString("en", { month: "long" })} ${s.getDate()}–${e.getDate()}`;
  }
  return `${s.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en", { month: "short", day: "numeric" })}`;
}

function countdown(deadlineStr, now) {
  const deadline = new Date(deadlineStr);
  const diff = deadline - now;
  if (diff <= 0) return { closed: true, label: "Closed" };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days >= 1) return { closed: false, label: `${days}d ${hours}h`, urgent: days < 2 };
  return { closed: false, label: `${hours}h`, urgent: true };
}

function anonymise({ workType, category, location }) {
  return `${workType} · ${category} · ${location}`;
}

function evocativeTitle({ workType, category }) {
  const map = {
    Editorial: "An editorial brief",
    Runway: "A runway brief",
    TVC: "A commercial TVC brief",
    Commercial: "A commercial brief",
  };
  return map[workType] || `A ${category.toLowerCase()} brief`;
}

const TALENT_ID = "1";

export function CastingBoard({ castings, myBookings, now = new Date("2026-04-18T20:00:00") }) {
  const enriched = useMemo(() => {
    return castings.map((c) => {
      const mine = c.interests?.find((i) => i.talentId === TALENT_ID);
      const [cs, ce] = parseRange(c.shootDates);
      const conflict = myBookings.find((b) => {
        const bs = b.date;
        const be = b.endDate || b.date;
        return overlaps(cs, ce, bs, be);
      });
      return {
        ...c,
        mine,
        conflict: conflict
          ? { date: conflict.date, client: conflict.client, type: conflict.type }
          : null,
        countdown: countdown(c.deadline, now),
      };
    });
  }, [castings, myBookings, now]);

  const [filter, setFilter] = useState("open");
  const [responses, setResponses] = useState({});
  const [confirm, setConfirm] = useState(null);

  const visible = enriched.filter((c) => {
    if (filter === "open") return c.status === "Open";
    if (filter === "closed") return c.status === "Closed";
    return true;
  });

  const submit = (castingId, response) => {
    setResponses((prev) => ({ ...prev, [castingId]: response }));
    setConfirm(null);
  };

  return (
    <div className="max-w-[1180px]">
      <div className="flex items-center gap-1 pb-8">
        {[
          { id: "open", label: "Open" },
          { id: "closed", label: "Closed" },
          { id: "all", label: "All" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
              filter === t.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto text-[11px] text-muted-foreground">
          Matching your category · Fashion · Lagos
        </div>
      </div>

      <ol className="border-t border-border">
        {visible.map((c, idx) => {
          const localResponse = responses[c.id];
          const existing = c.mine?.status;
          const response = localResponse || existing;
          const isClosed = c.status === "Closed" || c.countdown.closed;
          const hasResponse = Boolean(response);

          return (
            <li
              key={c.id}
              className={cn(
                "group relative border-b border-border py-8 transition-opacity duration-300",
                isClosed && "opacity-60"
              )}
            >
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 md:col-span-2">
                  <div
                    data-slot="numeric"
                    className="font-serif text-[34px] font-light leading-none tracking-[-0.02em] text-foreground/40"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                      isClosed
                        ? "bg-muted text-muted-foreground"
                        : c.countdown.urgent
                          ? "bg-destructive/10 text-destructive"
                          : "bg-surface-muted text-muted-foreground"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {isClosed ? "Closed" : `Closes in ${c.countdown.label}`}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-7">
                  <h3 className="font-serif text-[24px] font-light leading-[1.15] tracking-[-0.02em] text-foreground">
                    <span className="editorial-italic">{evocativeTitle(c)}</span>
                  </h3>
                  <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                    {anonymise(c)}
                  </div>

                  <p className="mt-4 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>

                  <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12px]">
                    <div>
                      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                        Dates
                      </dt>
                      <dd className="mt-0.5 text-foreground">
                        {formatDateRange(c.shootDates)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                        Location
                      </dt>
                      <dd className="mt-0.5 inline-flex items-center gap-1 text-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {c.location}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                        Requirements
                      </dt>
                      <dd className="mt-0.5 text-foreground">{c.requirements}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
                        Usage
                      </dt>
                      <dd className="mt-0.5 text-foreground">{c.mediaUsage}</dd>
                    </div>
                  </dl>

                  {c.conflict && !hasResponse && !isClosed && (
                    <div className="mt-5 inline-flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-[11.5px] text-warning">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        Calendar conflict · you have <em>{c.conflict.client}</em> on{" "}
                        {c.conflict.date}
                      </span>
                    </div>
                  )}
                </div>

                <div className="col-span-12 flex items-start justify-end md:col-span-3">
                  {isClosed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground">
                      Closed
                    </span>
                  ) : hasResponse ? (
                    <div
                      className={cn(
                        "slide-up-in inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium",
                        response === "interested"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {response === "interested" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      {response === "interested"
                        ? "Interest submitted"
                        : "Marked unavailable"}
                    </div>
                  ) : (
                    <div className="flex flex-col items-stretch gap-2 md:w-full">
                      <button
                        type="button"
                        onClick={() =>
                          c.conflict
                            ? setConfirm({ casting: c })
                            : submit(c.id, "interested")
                        }
                        className="group/btn relative inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-[12.5px] font-medium text-background transition-transform duration-150 hover:-translate-y-[1px]"
                      >
                        I'm interested
                      </button>
                      <button
                        type="button"
                        onClick={() => submit(c.id, "not_available")}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                      >
                        Not available
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}

        {visible.length === 0 && (
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

      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setConfirm(null)}
            className="absolute inset-0 bg-background/40 backdrop-blur-[6px]"
          />
          <div className="slide-up-in relative w-[min(440px,calc(100vw-32px))] rounded-2xl border border-border bg-card p-6 shadow-[0_20px_60px_-20px_oklch(0_0_0/0.3)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="mt-4 font-serif text-[22px] font-light leading-tight tracking-[-0.02em] text-foreground">
              <span className="editorial-italic">You have a booking</span> that overlaps.
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              <em>{confirm.casting.conflict.client}</em> ·{" "}
              {confirm.casting.conflict.type} on {confirm.casting.conflict.date}. Do you
              still want to express interest in this brief?
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => submit(confirm.casting.id, "interested")}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[12.5px] font-medium text-background transition-transform hover:-translate-y-[1px]"
              >
                Yes, I'm interested
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
