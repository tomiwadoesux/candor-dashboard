"use client";

import { useMemo, useState } from "react";
import { Check, Clock, FileText, MapPin, Search, X } from "lucide-react";

const TODAY = new Date("2026-04-18T00:00:00");

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Confirmed", label: "Confirmed" },
  { id: "In Progress", label: "In progress" },
  { id: "Pending", label: "Pending" },
  { id: "Casting", label: "Casting" },
];

function parseDate(d) {
  return new Date(`${d}T00:00:00`);
}

function fmtRange(start, end) {
  const s = parseDate(start);
  const e = parseDate(end || start);
  const sameDay = s.getTime() === e.getTime();
  const sameMonth = s.getMonth() === e.getMonth();
  const month = s.toLocaleString("en-GB", { month: "short" });
  if (sameDay) return { d: s.getDate(), month, year: s.getFullYear() };
  if (sameMonth)
    return {
      d: `${s.getDate()}–${e.getDate()}`,
      month,
      year: s.getFullYear(),
    };
  return {
    d: `${s.getDate()}–${e.getDate()}`,
    month: `${month}–${e.toLocaleString("en-GB", { month: "short" })}`,
    year: s.getFullYear(),
  };
}

function statusTone(status) {
  switch (status) {
    case "Confirmed":
      return "text-emerald-700 dark:text-emerald-400";
    case "In Progress":
      return "text-amber-700 dark:text-amber-400";
    case "Pending":
      return "text-muted-foreground";
    case "Casting":
      return "text-sky-700 dark:text-sky-400";
    default:
      return "text-muted-foreground";
  }
}

function statusDot(status) {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-500";
    case "In Progress":
      return "bg-amber-500";
    case "Casting":
      return "bg-sky-500";
    default:
      return "bg-muted-foreground";
  }
}

export function BookingsTable({ bookings }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const sorted = useMemo(
    () => [...bookings].sort((a, b) => parseDate(a.date) - parseDate(b.date)),
    [bookings]
  );

  const counts = useMemo(() => {
    const c = { all: bookings.length };
    bookings.forEach((b) => {
      c[b.status] = (c[b.status] || 0) + 1;
    });
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    return sorted.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        b.client.toLowerCase().includes(q) ||
        b.talent.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.territory?.toLowerCase().includes(q)
      );
    });
  }, [sorted, filter, query]);

  const open = filtered.find((b) => b.id === openId) || null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
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
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground focus-within:border-foreground/50">
          <Search className="h-3 w-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search client, talent, type"
            className="w-56 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {filtered.map((b, i) => {
          const r = fmtRange(b.date, b.endDate);
          const isLive = b.status === "In Progress";
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setOpenId(b.id)}
                className="group relative grid w-full grid-cols-12 items-start gap-x-4 py-5 text-left transition-colors hover:bg-muted/30"
              >
                {isLive && (
                  <span className="absolute left-0 top-5 h-10 w-[2px] bg-amber-500" />
                )}
                <div className="col-span-2 flex flex-col pl-4">
                  <span className="font-serif text-[32px] font-light leading-none tracking-[-0.02em] text-foreground">
                    {r.d}
                  </span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.month} · {r.year}
                  </span>
                </div>
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-6 min-w-0">
                  <h3 className="truncate font-serif text-[19px] font-light text-foreground">
                    {b.client}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="uppercase tracking-[0.1em]">{b.type}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {b.territory}
                    </span>
                    <span>{b.usageTerm}</span>
                    {b.dealMemo ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <FileText className="h-3 w-3" />
                        Deal memo signed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Deal memo pending
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-muted-foreground/80">
                    {b.talent}
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="font-serif text-[18px] font-light text-foreground">
                    {b.value}
                  </div>
                  <div
                    className={`mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${statusTone(
                      b.status
                    )}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot(b.status)}`} />
                    {b.status}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            Nothing matches.
          </li>
        )}
      </ul>

      {open && <BookingDetail booking={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function BookingDetail({ booking: b, onClose }) {
  const r = fmtRange(b.date, b.endDate);
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
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              {b.id.toUpperCase()}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${statusTone(
                b.status
              )}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot(b.status)}`} />
              {b.status}
            </span>
          </div>
          <h3 className="mt-2 font-serif text-[30px] font-light leading-tight text-foreground">
            <span className="editorial-italic">{b.client}</span>
          </h3>
          <div className="mt-1 text-[12px] text-muted-foreground">
            {b.type} · {b.talent}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
          <Field label="Dates">
            <span className="font-serif text-[20px] font-light">{r.d}</span>{" "}
            <span className="text-[12px] text-muted-foreground">
              {r.month} {r.year}
            </span>
          </Field>
          <Field label="Fee">
            <span className="font-serif text-[20px] font-light">{b.value}</span>
          </Field>
          <Field label="Territory">{b.territory}</Field>
          <Field label="Usage term">{b.usageTerm}</Field>
          <Field label="Media">{b.mediaUsage}</Field>
          <Field label="Deal memo">
            {b.dealMemo ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Check className="h-3 w-3" /> Signed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Clock className="h-3 w-3" /> Awaiting
              </span>
            )}
          </Field>
        </div>

        <div className="border-t border-border/60 p-4 text-center text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Created {b.createdAt} · managed by Candor
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-[13px] text-foreground">{children}</div>
    </div>
  );
}
