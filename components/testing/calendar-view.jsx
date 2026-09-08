"use client";

import { useMemo, useState } from "react";
import { CaretLeft, CaretRight, ArrowRight, MapPin, Clock } from "@phosphor-icons/react";
import { STATUS, MONTH_LONG, WEEKDAY_LONG, dayLabel, dateLabel } from "./bookings-data";

/*
  CALENDAR — the month as an object you can read at arm's length.

  A model's month is not a wall of hours, it is a handful of days that matter
  with long gaps between them, so this is a month grid rather than a day view.
  Each square carries only what you would scan for: whose day it is, and whether
  it is yours yet. The agenda beside it holds the detail for one chosen day.
*/

// The demo's present. Everything past-tense is measured from here.
const TODAY = "2026-03-09";

const WEEK_HEAD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function buildMonth(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // shift so Monday starts the week
  const days = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((offset + days) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => new Date(year, month, 1 - offset + i));
}

function money(list) {
  return list.reduce((sum, b) => sum + Number(b.fee.replace(/[^0-9]/g, "") || 0), 0);
}

export function CalendarView({ bookings, onGoTo, cardGap, innerRadius }) {
  const gapStyle =
    cardGap != null ? (typeof cardGap === "number" ? `${cardGap}px` : cardGap) : "var(--card-gap, 16px)";
  const radius =
    innerRadius != null
      ? typeof innerRadius === "number"
        ? `${innerRadius}px`
        : innerRadius
      : "var(--inner-radius, 16px)";

  const [cursor, setCursor] = useState({ year: 2026, month: 2 }); // March
  const [selected, setSelected] = useState(TODAY);

  // One pass over the book: what sits on each day, and what travels on each day.
  const { byDay, travelByDay } = useMemo(() => {
    const byDay = {};
    const travelByDay = {};
    for (const b of bookings) {
      (byDay[b.on] ??= []).push(b);
      if (b.travelOn) (travelByDay[b.travelOn] ??= []).push(b);
    }
    for (const list of Object.values(byDay)) list.sort((a, b) => a.call.localeCompare(b.call));
    return { byDay, travelByDay };
  }, [bookings]);

  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);

  const monthRows = bookings.filter((b) => {
    const d = new Date(`${b.on}T12:00:00`);
    return d.getFullYear() === cursor.year && d.getMonth() === cursor.month;
  });
  const confirmedRows = monthRows.filter((b) => b.status === "confirmed");
  const cities = new Set(monthRows.map((b) => b.city));
  const legs = monthRows.filter((b) => b.travelOn).length;

  const dayJobs = byDay[selected] ?? [];
  const dayTravel = travelByDay[selected] ?? [];
  const selectedDate = new Date(`${selected}T12:00:00`);

  // What is next, so an empty day still tells you something.
  const ahead = bookings
    .filter((b) => b.on > selected && STATUS[b.status].group !== "past")
    .sort((a, b) => a.on.localeCompare(b.on));
  const nextUp = ahead[0];
  const weekAhead = ahead.slice(1, 6);

  function step(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    const d = new Date(`${TODAY}T12:00:00`);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(TODAY);
  }

  return (
    <div style={{ padding: gapStyle }} className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* The month */}
        <section
          style={{ borderRadius: radius }}
          className="flex min-h-0 flex-col overflow-hidden border border-border bg-surface shadow-[var(--shadow-soft)]"
        >
          <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-4 py-2.5">
            <h2
              style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
              className="text-[19px] leading-none font-bold tracking-[0.01em] text-foreground"
            >
              {MONTH_LONG[cursor.month]}
            </h2>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {cursor.year}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={goToday}
                className="pressable mr-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous month"
                className="pressable grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
              >
                <CaretLeft size={13} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next month"
                className="pressable grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
              >
                <CaretRight size={13} weight="bold" />
              </button>
            </div>
          </header>

          <div className="grid shrink-0 grid-cols-7 border-b border-border/60">
            {WEEK_HEAD.map((d) => (
              <span
                key={d}
                className="py-1.5 text-center text-[9.5px] tracking-[0.08em] text-muted-foreground uppercase"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-7 auto-rows-fr">
            {cells.map((d) => {
              const key = iso(d);
              const outside = d.getMonth() !== cursor.month;
              const isToday = key === TODAY;
              const isSelected = key === selected;
              const jobs = byDay[key] ?? [];
              const travel = travelByDay[key] ?? [];
              const past = key < TODAY;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  /* No border on the last column or the last row — the section's
                     own edge already draws that line. */
                  className={`flex flex-col items-stretch gap-1 border-r border-b border-border/40 p-1.5 text-left outline-none transition-colors duration-140 ease-[var(--ease-out)] [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0 ${
                    isSelected ? "bg-surface-muted" : "hover:bg-surface-muted/50"
                  } ${outside ? "opacity-40" : ""}`}
                >
                  <span className="flex items-center gap-1">
                    <span
                      className={`grid h-[19px] min-w-[19px] place-items-center rounded-full px-1 font-mono text-[11.5px] tabular-nums ${
                        isToday
                          ? "bg-brand font-semibold text-brand-foreground"
                          : past
                            ? "text-muted-foreground/70"
                            : "font-medium text-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {jobs.length > 2 ? (
                      <span className="ml-auto text-[9px] text-muted-foreground">
                        +{jobs.length - 2}
                      </span>
                    ) : null}
                  </span>

                  {jobs.slice(0, 2).map((b) => (
                    <span
                      key={b.id}
                      className={`truncate rounded-[5px] px-1.5 py-[2px] text-[9.5px] leading-[1.35] ${
                        b.status === "confirmed"
                          ? "bg-brand-soft font-medium text-brand-soft-foreground"
                          : STATUS[b.status].group === "options"
                            ? "border border-dashed border-border-strong/60 bg-surface text-muted-foreground"
                            : // struck through only when the day was called off
                              b.status === "cancelled" || b.status === "released"
                              ? "bg-surface-muted text-muted-foreground line-through decoration-muted-foreground/50"
                              : "bg-surface-muted text-muted-foreground"
                      }`}
                    >
                      {b.client}
                    </span>
                  ))}

                  {jobs.length === 0 && travel.length > 0 ? (
                    <span className="truncate text-[9.5px] leading-[1.35] text-muted-foreground italic">
                      → {travel[0].city}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <footer className="flex shrink-0 flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>
              <span className="font-mono font-semibold text-foreground">{confirmedRows.length}</span>{" "}
              confirmed days
            </span>
            <span>
              <span className="font-mono font-semibold text-foreground">
                {monthRows.length - confirmedRows.length}
              </span>{" "}
              on option
            </span>
            <span>
              <span className="font-mono font-semibold text-foreground">{cities.size}</span> cities
            </span>
            <span>
              <span className="font-mono font-semibold text-foreground">{legs}</span> travel legs
            </span>
            <span className="ml-auto">
              <span className="font-mono font-semibold text-foreground">
                ${money(confirmedRows).toLocaleString()}
              </span>{" "}
              booked
            </span>
          </footer>
        </section>

        {/* The chosen day */}
        <section
          style={{ borderRadius: radius }}
          className="flex min-h-0 flex-col overflow-hidden border border-border bg-surface shadow-[var(--shadow-soft)]"
        >
          <header className="shrink-0 border-b border-border/60 px-4 py-3">
            <p
              style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
              className="text-[20px] leading-none font-bold tracking-[0.01em] text-foreground"
            >
              {WEEKDAY_LONG[selectedDate.getDay()]}
            </p>
            <p className="mt-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              {selectedDate.getDate()} {MONTH_LONG[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              {selected === TODAY ? " · today" : null}
            </p>
          </header>

          <div key={selected} className="slide-up-in min-h-0 flex-1 overflow-y-auto">
            {dayTravel.length > 0 ? (
              <div className="border-b border-border/60 px-4 py-3">
                {dayTravel.map((b) => (
                  <p key={b.id} className="text-[11.5px] leading-relaxed text-foreground">
                    <span className="mr-1 text-muted-foreground italic">→ {b.city}</span>
                    {b.travel}
                  </p>
                ))}
              </div>
            ) : null}

            {dayJobs.length === 0 ? (
              <div className="px-4 py-5">
                <p className="text-[12px] text-foreground">
                  {dayTravel.length > 0 ? "Travelling — nothing on the sheet." : "Nothing on the sheet."}
                </p>
                {nextUp ? (
                  <button
                    type="button"
                    onClick={() => setSelected(nextUp.on)}
                    className="pressable mt-3 flex w-full items-start gap-3 rounded-xl border border-border bg-surface-muted/40 p-3 text-left transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted"
                  >
                    <span className="font-mono text-[13.5px] leading-none font-semibold tracking-[-0.02em] tabular-nums text-brand">
                      {nextUp.call}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-foreground">
                        {nextUp.client}
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
                        Next up · {dateLabel(nextUp.on)}
                      </span>
                    </span>
                    <ArrowRight size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                  </button>
                ) : null}

                {/* A free day is still worth reading — here is what it is free before. */}
                {weekAhead.length > 0 ? (
                  <div className="mt-5 border-t border-border/60 pt-3">
                    <p className="text-[10px] tracking-[0.04em] text-muted-foreground uppercase">
                      After that
                    </p>
                    <ul className="mt-1.5 divide-y divide-border/40">
                      {weekAhead.map((b) => (
                        <li key={b.id}>
                          <button
                            type="button"
                            onClick={() => setSelected(b.on)}
                            className="hover-reveal -mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-lg px-2 py-[7px] text-left outline-none"
                          >
                            <span className="w-[42px] shrink-0 font-mono text-[10.5px] tabular-nums text-muted-foreground">
                              {dayLabel(b.on)}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[11.5px] text-foreground">
                              {b.client}
                              <span className="text-muted-foreground"> · {b.city}</span>
                            </span>
                            {b.status !== "confirmed" ? (
                              <span className="shrink-0 text-[9.5px] text-muted-foreground">
                                {STATUS[b.status].label}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {dayJobs.map((b) => (
                  <li key={b.id} className="px-4 py-3.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[15px] leading-none font-semibold tracking-[-0.02em] tabular-nums text-brand">
                        {b.call}
                      </span>
                      <span className="ml-auto font-mono text-[12px] tabular-nums text-foreground">
                        {b.fee}
                      </span>
                    </div>
                    <p className="mt-2 text-[13.5px] leading-tight font-semibold text-foreground">
                      {b.client}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{b.title}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {b.venue}, {b.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        wrap {b.wrap}
                      </span>
                    </div>

                    {b.status !== "confirmed" ? (
                      <p
                        style={
                          b.expires
                            ? {
                                background: "var(--urgent-soft)",
                                borderColor: "var(--urgent-line)",
                                color: "var(--urgent)",
                              }
                            : undefined
                        }
                        className={`mt-2 rounded-lg px-2 py-1 text-[10.5px] font-semibold ${
                          b.expires ? "border" : "bg-surface-muted text-muted-foreground"
                        }`}
                      >
                        {b.expires ?? `${STATUS[b.status].label} · ${b.optionRank ?? ""}`}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => onGoTo?.("bookings")}
                      className="pressable mt-2.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:text-foreground"
                    >
                      Open call sheet
                      <CaretRight size={10} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
