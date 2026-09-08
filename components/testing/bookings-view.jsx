"use client";

import { useRef, useState } from "react";
import {
  CalendarBlank,
  Clock,
  MapPin,
  Wallet,
  Check,
  X,
  ArrowRight,
  CaretRight,
  ChatCircleDots,
  FileText,
} from "@phosphor-icons/react";
import { initials } from "./roster";
import { STATUS, GROUPS, dayLabel, dateLabel } from "./bookings-data";

/*
  BOOKINGS — master/detail. The list is the spine; the pane on the right is the
  call sheet, in the order a model actually needs it: when and where, what the
  day looks like hour by hour, what to bring, what the agent said.

  The only interaction that genuinely matters here is deciding on an option, so
  that is the one that mutates state: accept or release moves the job between
  groups, switches the filter to follow it, and says what happened.
*/

const TONE = {
  brand: "bg-brand-soft text-brand-soft-foreground",
  muted: "bg-surface-muted text-muted-foreground",
};

function StatusPill({ status, className = "" }) {
  const meta = STATUS[status];
  return (
    <span
      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-medium ${TONE[meta.tone]} ${className}`}
    >
      {meta.label}
    </span>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] tracking-[0.04em] text-muted-foreground uppercase">
        {Icon ? <Icon size={11} /> : null}
        {label}
      </p>
      <p className="mt-0.5 truncate text-[12px] text-foreground">{value}</p>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] tracking-[0.04em] text-muted-foreground uppercase">{children}</p>
  );
}

export function BookingsView({ bookings, setBookings, onGoTo, cardGap, innerRadius }) {
  const gapStyle =
    cardGap != null ? (typeof cardGap === "number" ? `${cardGap}px` : cardGap) : "var(--card-gap, 16px)";
  const radius =
    innerRadius != null
      ? typeof innerRadius === "number"
        ? `${innerRadius}px`
        : innerRadius
      : "var(--inner-radius, 16px)";

  const [group, setGroup] = useState("upcoming");
  const [selectedId, setSelectedId] = useState("bottega");
  const [flash, setFlash] = useState(null);
  const rowRefs = useRef({});

  const counts = GROUPS.reduce((acc, g) => {
    acc[g.id] = bookings.filter((b) => STATUS[b.status].group === g.id).length;
    return acc;
  }, {});

  // Chronological, always. Past reads newest first; everything else counts down to it.
  const visible = bookings
    .filter((b) => STATUS[b.status].group === group)
    .sort((a, b) => (group === "past" ? b.on.localeCompare(a.on) : a.on.localeCompare(b.on)));
  // Fall back rather than syncing in an effect — switching filters can strand a selection.
  const selected = visible.find((b) => b.id === selectedId) ?? visible[0] ?? null;

  const booked = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.fee.replace(/[^0-9]/g, "") || 0), 0);

  function decide(id, nextStatus, message) {
    setBookings((prev) =>
      prev.map((b) =>
        // Confirming settles the deadline, so the expiry warning goes with it.
        b.id === id ? { ...b, status: nextStatus, expires: undefined } : b
      )
    );
    setSelectedId(id);
    setGroup(STATUS[nextStatus].group); // follow the job so it never just vanishes
    setFlash({ id, message });
  }

  function handleListKeyDown(e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = visible.findIndex((b) => b.id === selected?.id);
    const next =
      visible[e.key === "ArrowDown" ? Math.min(visible.length - 1, i + 1) : Math.max(0, i - 1)];
    if (!next) return;
    setSelectedId(next.id);
    rowRefs.current[next.id]?.focus();
  }

  return (
    <div style={{ padding: gapStyle }} className="flex h-full min-h-0 flex-col gap-3">
      {/* Filter row — groups on the left, the number that matters on the right */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-surface-muted p-0.5">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className={`pressable rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors duration-140 ease-[var(--ease-out)] ${
                group === g.id
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g.label}
              <span className="ml-1 text-[10px] tabular-nums opacity-60">{counts[g.id]}</span>
            </button>
          ))}
        </div>
        <p className="ml-auto flex items-baseline gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-mono text-[13px] font-semibold text-foreground">
            ${booked.toLocaleString()}
          </span>
          confirmed
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* List */}
        <section
          style={{ borderRadius: radius }}
          className="flex min-h-0 flex-col overflow-hidden border border-border bg-surface shadow-[var(--shadow-soft)]"
        >
          {visible.length === 0 ? (
            <p className="m-auto px-6 text-center text-[11.5px] text-muted-foreground">
              Nothing in {GROUPS.find((g) => g.id === group).label.toLowerCase()} right now.
            </p>
          ) : (
            <ul
              onKeyDown={handleListKeyDown}
              className="stagger-in min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto"
            >
              {visible.map((b) => {
                const active = selected?.id === b.id;
                const urgentDot = Boolean(b.expires) || b.paid === false;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      ref={(el) => {
                        rowRefs.current[b.id] = el;
                      }}
                      onClick={() => setSelectedId(b.id)}
                      className={`hover-reveal flex w-full items-center gap-3 px-3.5 py-[11px] text-left outline-none focus-visible:bg-surface-muted ${
                        active ? "bg-surface-muted" : ""
                      }`}
                    >
                      <span className="w-[42px] shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
                        {dayLabel(b.on)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`truncate text-[12.5px] text-foreground ${
                              active ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {b.client}
                          </span>
                          {urgentDot ? (
                            <span
                              style={{ background: "var(--urgent)" }}
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                            />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
                          {b.kind} · {b.city} · call {b.call}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-mono text-[11.5px] font-medium text-foreground">
                          {b.fee}
                        </span>
                        <StatusPill status={b.status} className="mt-1 inline-block" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Detail — the call sheet */}
        <section
          style={{ borderRadius: radius }}
          className="flex min-h-0 flex-col overflow-hidden border border-border bg-surface shadow-[var(--shadow-soft)]"
        >
          {!selected ? (
            <p className="m-auto px-6 text-center text-[11.5px] text-muted-foreground">
              Pick a booking to see the call sheet.
            </p>
          ) : (
            <>
              <div key={selected.id} className="slide-up-in min-h-0 flex-1 overflow-y-auto p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <StatusPill status={selected.status} />
                      {selected.optionRank && STATUS[selected.status].group === "options" ? (
                        <span className="text-[10px] text-muted-foreground">{selected.optionRank}</span>
                      ) : null}
                    </div>
                    <p
                      style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
                      className="mt-1.5 truncate text-[20px] leading-none font-bold tracking-[0.01em] text-foreground"
                    >
                      {selected.client}
                    </p>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">{selected.title}</p>
                  </div>
                  <div className="ml-auto shrink-0 text-right">
                    <p className="font-mono text-[17px] leading-none font-semibold text-foreground">
                      {selected.fee}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{selected.kind}</p>
                  </div>
                </div>

                {/* What just happened, if anything did */}
                {flash?.id === selected.id ? (
                  <p className="slide-up-in mt-3 rounded-lg bg-brand-soft px-2.5 py-1.5 text-[11px] font-medium text-brand-soft-foreground">
                    {flash.message}
                  </p>
                ) : null}

                {/* An option deadline is the one genuinely time-critical thing here */}
                {selected.expires && STATUS[selected.status].group === "options" ? (
                  <p
                    style={{
                      background: "var(--urgent-soft)",
                      borderColor: "var(--urgent-line)",
                      color: "var(--urgent)",
                    }}
                    className="mt-3 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold"
                  >
                    {selected.expires}
                  </p>
                ) : null}

                <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/60 pt-3.5">
                  <Field icon={CalendarBlank} label="Date" value={dateLabel(selected.on)} />
                  <Field icon={Clock} label="Call" value={`${selected.call} · wrap ${selected.wrap}`} />
                  <Field icon={MapPin} label="Location" value={selected.venue} />
                  <Field icon={MapPin} label="Address" value={selected.address} />
                  <Field icon={Wallet} label="Fee" value={selected.feeNote} />
                  <Field icon={FileText} label="Usage" value={selected.usage} />
                </div>

                {selected.travel ? (
                  <p className="mt-3 rounded-lg bg-surface-muted/60 px-2.5 py-1.5 text-[11px] text-foreground">
                    <span className="font-semibold text-muted-foreground">Travel · </span>
                    {selected.travel}
                  </p>
                ) : null}

                {selected.schedule.length > 0 ? (
                  <div className="mt-3.5 border-t border-border/60 pt-3.5">
                    <SectionLabel>Running order</SectionLabel>
                    {/* The clock is the point of this block, so the time carries the
                        weight and the call time — the one you cannot be late for —
                        takes the accent. The rail keeps the day reading as a day. */}
                    <ul className="mt-2">
                      {selected.schedule.map(([time, what], i) => {
                        const isCall = i === 0;
                        const isLast = i === selected.schedule.length - 1;
                        return (
                          <li key={time + what} className="flex gap-3">
                            <span
                              className={`w-[50px] shrink-0 font-mono text-[13.5px] leading-[1.15] font-semibold tracking-[-0.02em] tabular-nums ${
                                isCall ? "text-brand" : "text-foreground"
                              }`}
                            >
                              {time}
                            </span>
                            <span className="flex w-2 shrink-0 flex-col items-center">
                              <span
                                className={`mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full ${
                                  isCall ? "bg-brand" : "bg-muted-foreground/35"
                                }`}
                              />
                              {!isLast ? <span className="w-px flex-1 bg-border" /> : null}
                            </span>
                            <span
                              className={`min-w-0 flex-1 text-[12px] leading-[1.15] text-foreground ${
                                isLast ? "" : "pb-3"
                              }`}
                            >
                              {what}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {selected.bring.length > 0 ? (
                  <div className="mt-3.5 border-t border-border/60 pt-3.5">
                    <SectionLabel>Bring</SectionLabel>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {selected.bring.map((item) => (
                        <li
                          key={item}
                          className="rounded-lg bg-surface-muted/70 px-2 py-1 text-[11px] text-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-3.5 border-t border-border/60 pt-3.5">
                  <SectionLabel>From your agent</SectionLabel>
                  <div className="mt-1.5 flex items-start gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-muted text-[9px] font-semibold text-foreground">
                      {initials(selected.agent)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-medium text-foreground">{selected.agent}</p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                        {selected.note}
                      </p>
                    </div>
                  </div>
                </div>

                {selected.paid === false ? (
                  <p
                    style={{
                      background: "var(--urgent-soft)",
                      borderColor: "var(--urgent-line)",
                      color: "var(--urgent)",
                    }}
                    className="mt-3.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold"
                  >
                    Payment past terms — {selected.fee} outstanding
                  </p>
                ) : null}
              </div>

              {/* Actions — pinned, because a decision should never need a scroll */}
              <footer className="flex shrink-0 items-center gap-2 border-t border-border/60 bg-surface/80 px-4 py-3 backdrop-blur-xs">
                {STATUS[selected.status].group === "options" ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        decide(selected.id, "confirmed", "Option accepted — moved to upcoming.")
                      }
                      className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[12px] font-semibold text-brand-foreground transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110"
                    >
                      <Check size={13} weight="bold" />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        decide(
                          selected.id,
                          "released",
                          `Option released — ${selected.agent.split(" ")[0]} has been told.`
                        )
                      }
                      className="pressable flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
                    >
                      <X size={13} />
                      Release
                    </button>
                  </>
                ) : selected.status === "confirmed" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onGoTo?.("messages")}
                      className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[12px] font-semibold text-brand-foreground transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110"
                    >
                      <ChatCircleDots size={13} weight="fill" />
                      Message {selected.agent.split(" ")[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => onGoTo?.("calendar")}
                      className="pressable flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
                    >
                      <CalendarBlank size={13} />
                      Calendar
                    </button>
                  </>
                ) : selected.paid === false ? (
                  <button
                    type="button"
                    onClick={() => onGoTo?.("payments")}
                    className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[12px] font-semibold text-brand-foreground transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110"
                  >
                    Chase payment
                    <ArrowRight size={13} weight="bold" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onGoTo?.("payments")}
                    className="pressable flex items-center gap-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
                  >
                    View statement
                    <CaretRight size={12} />
                  </button>
                )}
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
