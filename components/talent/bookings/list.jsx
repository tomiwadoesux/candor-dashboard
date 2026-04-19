"use client";

import { useMemo, useState } from "react";
import { Check, Clock, FileText, MapPin, Sparkles, X } from "lucide-react";

const NOW = new Date("2026-04-18T20:00:00");

const FILTERS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "In progress" },
  { id: "past", label: "Past" },
];

function parseDate(d) {
  return new Date(`${d}T00:00:00`);
}

function classify(b) {
  const start = parseDate(b.date);
  const end = parseDate(b.endDate || b.date);
  if (NOW < start) return "upcoming";
  if (NOW > end && b.status !== "In Progress") return "past";
  return "active";
}

function formatRange(start, end) {
  const s = parseDate(start);
  const e = parseDate(end || start);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const month = s.toLocaleString("en-GB", { month: "short" });
  const year = s.getFullYear();
  if (start === (end || start)) {
    return { d1: s.getDate(), d2: null, month, year };
  }
  if (sameMonth) {
    return { d1: s.getDate(), d2: e.getDate(), month, year };
  }
  return {
    d1: s.getDate(),
    d2: e.getDate(),
    month: `${month} – ${e.toLocaleString("en-GB", { month: "short" })}`,
    year,
  };
}

function statusTone(status) {
  switch (status) {
    case "Confirmed":
      return "text-emerald-700 dark:text-emerald-400";
    case "In Progress":
      return "text-amber-700 dark:text-amber-400";
    case "Pending":
    case "Option":
      return "text-muted-foreground";
    case "Casting":
      return "text-sky-700 dark:text-sky-400";
    default:
      return "text-muted-foreground";
  }
}

function StatusDot({ status }) {
  const tone =
    status === "Confirmed"
      ? "bg-emerald-500"
      : status === "In Progress"
      ? "bg-amber-500"
      : status === "Option" || status === "Pending"
      ? "bg-muted-foreground"
      : "bg-sky-500";
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      {status === "In Progress" && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${tone} opacity-75`} />
      )}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tone}`} />
    </span>
  );
}

export function BookingsList({ bookings }) {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const withBucket = useMemo(
    () =>
      bookings
        .map((b) => ({ ...b, bucket: classify(b) }))
        .sort((a, b) => parseDate(a.date) - parseDate(b.date)),
    [bookings]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return withBucket;
    return withBucket.filter((b) => b.bucket === filter);
  }, [withBucket, filter]);

  const counts = useMemo(() => {
    const byBucket = { upcoming: 0, active: 0, past: 0 };
    withBucket.forEach((b) => {
      byBucket[b.bucket] = (byBucket[b.bucket] || 0) + 1;
    });
    return { ...byBucket, all: withBucket.length };
  }, [withBucket]);

  const open = filtered.find((b) => b.id === openId) || null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
              <span
                className={`font-mono text-[9.5px] ${
                  active ? "text-background/70" : "text-muted-foreground/60"
                }`}
              >
                {counts[f.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 border-y border-border/60 py-10 text-center text-[13px] text-muted-foreground">
          Nothing here yet.
        </div>
      )}

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {filtered.map((b, i) => {
          const r = formatRange(b.date, b.endDate);
          const isActive = b.bucket === "active";
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setOpenId(b.id)}
                className="group relative flex w-full items-start gap-8 py-6 text-left transition-colors hover:bg-muted/30"
              >
                {isActive && (
                  <span className="absolute left-0 top-6 h-10 w-[2px] bg-amber-500" />
                )}
                <div className="flex w-24 shrink-0 flex-col items-start pl-4">
                  <div className="font-serif text-[44px] font-light leading-none tracking-[-0.02em] text-foreground">
                    {r.d1}
                    {r.d2 && (
                      <span className="text-muted-foreground/50">–{r.d2}</span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.month} · {r.year}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[9.5px] text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="truncate font-serif text-[22px] font-light text-foreground">
                      {b.client}
                    </h3>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
                    <span className="uppercase tracking-[0.1em]">{b.type}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {b.territory}
                    </span>
                    <span>{b.usageTerm}</span>
                    {b.dealMemo && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <FileText className="h-3 w-3" />
                        Deal memo
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="font-serif text-[18px] font-light text-foreground">
                    {b.value}
                  </div>
                  <div
                    className={`mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${statusTone(
                      b.status
                    )}`}
                  >
                    <StatusDot status={b.status} />
                    {b.status}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {open && <BookingDetail booking={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function BookingDetail({ booking: b, onClose }) {
  const r = formatRange(b.date, b.endDate);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-[620px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-border/60 p-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Booking · {b.id.toUpperCase()}
          </div>
          <h3 className="mt-2 font-serif text-[32px] font-light leading-tight text-foreground">
            <span className="editorial-italic">{b.client}</span>
          </h3>
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="uppercase tracking-[0.1em]">{b.type}</span>
            <span>·</span>
            <span className={statusTone(b.status)}>
              <StatusDot status={b.status} /> <span className="ml-1">{b.status}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">
          <DetailRow label="Dates">
            <span className="font-serif text-[20px] font-light text-foreground">
              {r.d1}
              {r.d2 && `–${r.d2}`}
            </span>{" "}
            <span className="text-[12px] text-muted-foreground">
              {r.month} {r.year}
            </span>
          </DetailRow>
          <DetailRow label="Fee">
            <span className="font-serif text-[20px] font-light text-foreground">
              {b.value}
            </span>
          </DetailRow>
          <DetailRow label="Territory">{b.territory}</DetailRow>
          <DetailRow label="Usage term">{b.usageTerm}</DetailRow>
          <DetailRow label="Media">{b.mediaUsage}</DetailRow>
          <DetailRow label="Deal memo">
            {b.dealMemo ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Signed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" /> Awaiting
              </span>
            )}
          </DetailRow>
        </div>

        {b.brief && (
          <div className="border-t border-border/60 bg-muted/30 p-6">
            <div className="flex items-baseline gap-2">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                From Candor
              </span>
            </div>
            <p className="mt-2 font-serif text-[14.5px] font-light italic leading-relaxed text-foreground">
              &ldquo;{b.brief}&rdquo;
            </p>
          </div>
        )}

        <div className="border-t border-border/60 p-4 text-center text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Questions? Reply in Communications.
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-[13px] text-foreground">{children}</div>
    </div>
  );
}
