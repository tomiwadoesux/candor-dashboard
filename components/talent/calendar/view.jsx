"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";

const TODAY = new Date("2026-04-18T00:00:00");
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const KINDS = {
  confirmed: {
    label: "Confirmed",
    dot: "bg-emerald-500",
    chip: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500/90",
    tint: "bg-emerald-500/8",
    ring: "ring-emerald-500/20",
  },
  option: {
    label: "Option",
    dot: "bg-amber-500",
    chip: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500/90",
    tint: "bg-amber-500/8",
    ring: "ring-amber-500/20",
  },
  pending: {
    label: "Pending",
    dot: "bg-muted-foreground",
    chip: "text-muted-foreground",
    bar: "bg-muted-foreground/80",
    tint: "bg-muted-foreground/8",
    ring: "ring-muted-foreground/20",
  },
  casting: {
    label: "Casting",
    dot: "bg-sky-500",
    chip: "text-sky-700 dark:text-sky-400",
    bar: "bg-sky-500/90",
    tint: "bg-sky-500/8",
    ring: "ring-sky-500/20",
  },
  test: {
    label: "Test shoot",
    dot: "bg-violet-500",
    chip: "text-violet-700 dark:text-violet-400",
    bar: "bg-violet-500/90",
    tint: "bg-violet-500/8",
    ring: "ring-violet-500/20",
  },
  hold: {
    label: "Hold",
    dot: "bg-rose-400",
    chip: "text-rose-700 dark:text-rose-400",
    bar: "bg-rose-400/80",
    tint: "bg-rose-400/8",
    ring: "ring-rose-400/20",
  },
};

function parseDate(d) {
  return new Date(`${d}T00:00:00`);
}

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekdayOffset(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

function eventsOn(events, date) {
  return events.filter((e) => {
    const s = parseDate(e.start);
    const end = parseDate(e.end || e.start);
    return date >= s && date <= end;
  });
}

function daysUntil(date) {
  const ms = date.getTime() - TODAY.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function relative(date) {
  const d = daysUntil(date);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  if (d > 1 && d < 14) return `In ${d} days`;
  if (d < -1 && d > -14) return `${-d} days ago`;
  return date.toLocaleString("en-GB", { day: "numeric", month: "short" });
}

export function CalendarView({ events }) {
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useState(fmt(TODAY));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const dim = daysInMonth(year, month);
  const offset = firstWeekdayOffset(year, month);

  const selectedDate = parseDate(selected);
  const selectedEvents = eventsOn(events, selectedDate);

  const monthEvents = useMemo(
    () =>
      events.filter((e) => {
        const s = parseDate(e.start);
        const end = parseDate(e.end || e.start);
        const lastOfMonth = new Date(year, month + 1, 0);
        const firstOfMonth = new Date(year, month, 1);
        return end >= firstOfMonth && s <= lastOfMonth;
      }),
    [events, year, month]
  );

  const counts = useMemo(() => {
    const byKind = {};
    monthEvents.forEach((e) => {
      byKind[e.kind] = (byKind[e.kind] || 0) + 1;
    });
    return byKind;
  }, [monthEvents]);

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((e) => parseDate(e.end || e.start) >= TODAY)
        .sort(
          (a, b) =>
            parseDate(a.start).getTime() - parseDate(b.start).getTime()
        )
        .slice(0, 5),
    [events]
  );

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const confirmedCount = counts.confirmed || 0;
  const optionCount = counts.option || 0;

  return (
    <div>
      {/* Header + month nav */}
      <div className="flex items-end justify-between border-b border-border/60 pb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {confirmedCount > 0
              ? `${confirmedCount} confirmed · ${optionCount} option${
                  optionCount === 1 ? "" : "s"
                }`
              : "Nothing confirmed this month"}
          </div>
          <h3 className="mt-2 font-serif text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-foreground">
            <span className="editorial-italic">
              {cursor.toLocaleString("en-GB", { month: "long" })}
            </span>
            <span className="ml-3 text-muted-foreground/50">{year}</span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const t = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
              setCursor(t);
              setSelected(fmt(TODAY));
            }}
            className="h-9 rounded-full border border-border/60 px-4 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10.5px] text-muted-foreground">
        {Object.entries(KINDS).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
            <span className="uppercase tracking-[0.12em]">{v.label}</span>
            {counts[k] ? (
              <span className="font-mono text-[9.5px] text-muted-foreground/50">
                {counts[k]}
              </span>
            ) : null}
          </span>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Month grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-7 border-b border-border/60 pb-2 text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/60">
            {WEEK.map((w) => (
              <div key={w} className="text-center font-medium">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-sm border border-border/50 [&>*]:border-b [&>*]:border-r [&>*]:border-border/40 [&>*:nth-child(7n)]:border-r-0">
            {cells.map((date, i) => {
              if (!date) {
                return (
                  <div
                    key={`e${i}`}
                    className="min-h-[108px] bg-muted/15"
                  />
                );
              }
              const cellEvents = eventsOn(monthEvents, date);
              const isToday = sameDay(date, TODAY);
              const isSelected = fmt(date) === selected;
              const isPast =
                date <
                new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const primary = cellEvents[0];

              return (
                <button
                  key={fmt(date)}
                  type="button"
                  onClick={() => setSelected(fmt(date))}
                  className={`group relative min-h-[108px] p-2.5 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-foreground text-background"
                      : isToday
                      ? "bg-foreground/[0.04] hover:bg-foreground/[0.06]"
                      : isWeekend
                      ? "bg-muted/20 hover:bg-muted/40"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {/* Date number */}
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`font-serif leading-none ${
                        isToday
                          ? "text-[24px] font-light"
                          : "text-[16px] font-light"
                      } ${
                        isPast && !isSelected && !isToday
                          ? "text-muted-foreground/50"
                          : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span
                        className={`font-mono text-[8.5px] uppercase tracking-[0.12em] ${
                          isSelected ? "text-background/70" : "text-foreground"
                        }`}
                      >
                        Today
                      </span>
                    )}
                    {!isToday && cellEvents.length > 1 && (
                      <span
                        className={`font-mono text-[9px] ${
                          isSelected
                            ? "text-background/70"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {cellEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Primary event pill */}
                  {primary && (
                    <div className="mt-2 space-y-1">
                      <div
                        className={`flex items-center gap-1 overflow-hidden rounded-[3px] px-1.5 py-1 text-[10px] leading-tight ${
                          isSelected
                            ? "bg-background/15 text-background"
                            : `${KINDS[primary.kind].tint} ring-1 ${
                                KINDS[primary.kind].ring
                              } ring-inset`
                        }`}
                      >
                        <span
                          className={`h-full w-[2px] rounded-sm ${
                            isSelected
                              ? "bg-background/80"
                              : KINDS[primary.kind].bar
                          }`}
                          style={{ minHeight: 10 }}
                        />
                        <span
                          className={`truncate font-medium ${
                            isSelected ? "" : "text-foreground/85"
                          }`}
                        >
                          {primary.title}
                        </span>
                      </div>
                      {cellEvents[1] && (
                        <div
                          className={`flex items-center gap-1 overflow-hidden rounded-[3px] px-1.5 py-1 text-[10px] leading-tight ${
                            isSelected
                              ? "bg-background/10 text-background/80"
                              : `${KINDS[cellEvents[1].kind].tint} ring-1 ${
                                  KINDS[cellEvents[1].kind].ring
                                } ring-inset`
                          }`}
                        >
                          <span
                            className={`h-full w-[2px] rounded-sm ${
                              isSelected
                                ? "bg-background/60"
                                : KINDS[cellEvents[1].kind].bar
                            }`}
                            style={{ minHeight: 10 }}
                          />
                          <span
                            className={`truncate ${
                              isSelected ? "" : "text-foreground/70"
                            }`}
                          >
                            {cellEvents[1].title}
                          </span>
                        </div>
                      )}
                      {cellEvents.length > 2 && (
                        <div
                          className={`pl-1 font-mono text-[9px] ${
                            isSelected
                              ? "text-background/60"
                              : "text-muted-foreground/60"
                          }`}
                        >
                          +{cellEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day + upcoming */}
        <div className="space-y-10 lg:col-span-4">
          <section>
            <div className="flex items-baseline justify-between border-b border-border/60 pb-3">
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
                  {relative(selectedDate)}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-[34px] font-light leading-none text-foreground">
                    {selectedDate.getDate()}
                  </span>
                  <span className="font-serif text-[14px] italic text-muted-foreground">
                    {selectedDate.toLocaleString("en-GB", {
                      weekday: "long",
                    })}
                    <span className="ml-1 text-muted-foreground/60">
                      ·{" "}
                      {selectedDate.toLocaleString("en-GB", {
                        month: "long",
                      })}
                    </span>
                  </span>
                </div>
              </div>
              <span className="font-mono text-[9.5px] text-muted-foreground/60">
                {selectedEvents.length} event
                {selectedEvents.length === 1 ? "" : "s"}
              </span>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="mt-6 rounded-sm border border-dashed border-border/60 bg-muted/20 p-5 text-center">
                <p className="font-serif text-[14px] italic text-muted-foreground">
                  Nothing on this day.
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  A quiet window — good for a test shoot.
                </p>
              </div>
            ) : (
              <ul className="mt-5 space-y-4">
                {selectedEvents.map((e) => (
                  <li
                    key={e.id}
                    className={`relative overflow-hidden rounded-sm border border-border/50 bg-card p-4 ${KINDS[e.kind].tint}`}
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-[3px] ${KINDS[e.kind].bar}`}
                    />
                    <div className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.14em]">
                      <span className={KINDS[e.kind].chip}>
                        {KINDS[e.kind].label}
                      </span>
                      {e.time && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                          <Clock className="h-2.5 w-2.5" />
                          {e.time}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 font-serif text-[18px] font-light leading-snug text-foreground">
                      {e.title}
                    </div>
                    {(e.type || e.location) && (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                        {e.type && <span>{e.type}</span>}
                        {e.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {e.location}
                          </span>
                        )}
                      </div>
                    )}
                    {e.note && (
                      <p className="mt-2.5 font-serif text-[12.5px] italic leading-relaxed text-muted-foreground">
                        &ldquo;{e.note}&rdquo;
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Upcoming strip */}
          <section>
            <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
              <h4 className="font-serif text-[16px] font-light text-foreground">
                <span className="editorial-italic">Up next</span>
              </h4>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/60">
                Chronological
              </span>
            </div>
            <ul className="mt-2 divide-y divide-border/40">
              {upcoming.length === 0 ? (
                <li className="py-4 text-[12px] italic text-muted-foreground">
                  No upcoming bookings.
                </li>
              ) : (
                upcoming.map((e) => {
                  const d = parseDate(e.start);
                  const du = daysUntil(d);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                          setSelected(fmt(d));
                        }}
                        className="group flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-muted/20"
                      >
                        <div className="w-12 shrink-0 text-center">
                          <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground/60">
                            {d.toLocaleString("en-GB", { month: "short" })}
                          </div>
                          <div className="font-serif text-[22px] font-light leading-none text-foreground">
                            {d.getDate()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em]">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${KINDS[e.kind].dot}`}
                            />
                            <span className={KINDS[e.kind].chip}>
                              {KINDS[e.kind].label}
                            </span>
                            <span className="ml-auto font-mono text-[9px] text-muted-foreground/60">
                              {du === 0 ? "today" : du === 1 ? "tmrw" : `${du}d`}
                            </span>
                          </div>
                          <div className="mt-0.5 truncate font-serif text-[14px] font-light text-foreground">
                            {e.title}
                          </div>
                          {e.location && (
                            <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                              {e.location}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
