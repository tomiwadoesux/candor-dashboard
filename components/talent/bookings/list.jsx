"use client";

import { useState } from "react";
import { ChevronDown, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateShort, money, statusLabel, timeShort } from "@/lib/format";
import { bookingTone } from "@/components/talent/status-tones";

function StatusChip({ status }) {
  const tone = bookingTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${tone.text}`}
    >
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {statusLabel(status)}
    </span>
  );
}

function dateParts(b) {
  const s = new Date(`${b.booking_date}T00:00:00`);
  const e = b.booking_end_date ? new Date(`${b.booking_end_date}T00:00:00`) : s;
  const sameDay = b.booking_date === (b.booking_end_date ?? b.booking_date);
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const month = s.toLocaleString("en-GB", { month: "short" });
  if (sameDay) return { d1: s.getDate(), d2: null, month, year: s.getFullYear() };
  if (sameMonth) {
    return { d1: s.getDate(), d2: e.getDate(), month, year: s.getFullYear() };
  }
  return {
    d1: s.getDate(),
    d2: e.getDate(),
    month: `${month} – ${e.toLocaleString("en-GB", { month: "short" })}`,
    year: s.getFullYear(),
  };
}

function BookingRow({ booking: b, index, open, onToggle }) {
  const r = dateParts(b);

  const details = [
    ["Dates", b.booking_end_date && b.booking_end_date !== b.booking_date
      ? `${dateShort(b.booking_date)} – ${dateShort(b.booking_end_date)}`
      : dateShort(b.booking_date)],
    ["Call time", b.call_time ? timeShort(b.call_time) : "—"],
    [
      "Location",
      [statusLabel(b.location_city), b.location_address].filter(Boolean).join(" · "),
    ],
    ["Duration", b.duration_description || "—"],
    ["Fee", money(b.talent_fee, b.fee_currency)],
    ["Media usage", b.media_usage || "—"],
    ["Territory", b.territory || "—"],
    ["Usage term", b.usage_term || "—"],
    [
      "Overtime",
      b.overtime_rate != null ? money(b.overtime_rate, b.fee_currency) : "—",
    ],
  ];

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="pressable group relative flex w-full items-start gap-8 py-6 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex w-24 shrink-0 flex-col items-start pl-4">
          <div
            data-slot="numeric"
            className="font-serif text-[44px] font-light leading-none tracking-[-0.02em] text-foreground"
          >
            {r.d1}
            {r.d2 && <span className="text-muted-foreground/50">–{r.d2}</span>}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {r.month} · {r.year}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[9.5px] text-muted-foreground/60">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="truncate font-serif text-[22px] font-light text-foreground">
              {b.project_title}
            </h3>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
            {b.service_type && (
              <span className="uppercase tracking-[0.1em]">{b.service_type}</span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {statusLabel(b.location_city)}
            </span>
            {b.call_time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Call {timeShort(b.call_time)}
              </span>
            )}
            {b.usage_term && <span>{b.usage_term}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-3 text-right">
          <div>
            <div
              data-slot="numeric"
              className="font-serif text-[18px] font-light text-foreground"
            >
              {money(b.talent_fee, b.fee_currency)}
            </div>
            <div className="mt-1">
              <StatusChip status={b.status} />
            </div>
          </div>
          <ChevronDown
            className={cn(
              "mt-1.5 h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="slide-up-in pb-8 pl-[8.5rem] pr-4">
          <div className="rounded-xl border border-border bg-surface-muted/40 p-5">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 text-[13px] text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            {b.notes && (
              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  From Candor
                </div>
                <p className="mt-1.5 font-serif text-[14px] font-light italic leading-relaxed text-foreground">
                  &ldquo;{b.notes}&rdquo;
                </p>
              </div>
            )}
            <div className="mt-5 border-t border-border/60 pt-3 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/70">
              View only · questions go through Communications
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Section({ title, caption, bookings, openId, setOpenId, emptyCopy }) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
        <h3 className="font-serif text-[22px] font-light text-foreground">
          <span className="editorial-italic">{title}</span>
        </h3>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          {caption}
        </span>
      </div>
      {bookings.length === 0 ? (
        <div className="border-b border-border/60 py-10 text-center text-[13px] text-muted-foreground">
          {emptyCopy}
        </div>
      ) : (
        <ul className="divide-y divide-border/60 border-b border-border/60">
          {bookings.map((b, i) => (
            <BookingRow
              key={b.id}
              booking={b}
              index={i}
              open={openId === b.id}
              onToggle={() => setOpenId(openId === b.id ? null : b.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export function BookingsList({ upcoming, past }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div>
      <Section
        title="Upcoming"
        caption="Soonest first"
        bookings={upcoming}
        openId={openId}
        setOpenId={setOpenId}
        emptyCopy="No bookings yet — your booker will confirm your first job soon."
      />
      <Section
        title="Past"
        caption="Most recent first"
        bookings={past}
        openId={openId}
        setOpenId={setOpenId}
        emptyCopy="Nothing in the archive yet."
      />
    </div>
  );
}
