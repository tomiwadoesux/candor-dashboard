"use client";

import { useState } from "react";
import { ChevronDown, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateShort, money, statusLabel, timeShort } from "@/lib/format";
import { bookingTone } from "@/components/talent/status-tones";
import { SectionHead, ToneChip } from "@/components/talent/kit";

function dateParts(b) {
  const s = new Date(`${b.booking_date}T00:00:00`);
  const e = b.booking_end_date ? new Date(`${b.booking_end_date}T00:00:00`) : s;
  const sameDay = b.booking_date === (b.booking_end_date ?? b.booking_date);
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const month = s.toLocaleString("en-GB", { month: "short" });
  if (sameDay) return { d1: s.getDate(), d2: null, month };
  if (sameMonth) return { d1: s.getDate(), d2: e.getDate(), month };
  return {
    d1: s.getDate(),
    d2: e.getDate(),
    month: `${month}–${e.toLocaleString("en-GB", { month: "short" })}`,
  };
}

function BookingRow({ booking: b, open, onToggle }) {
  const r = dateParts(b);
  const tone = bookingTone(b.status);

  const details = [
    [
      "Dates",
      b.booking_end_date && b.booking_end_date !== b.booking_date
        ? `${dateShort(b.booking_date)} – ${dateShort(b.booking_end_date)}`
        : dateShort(b.booking_date),
    ],
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
        className="hover-reveal group flex w-full items-center gap-4 rounded-lg px-2 py-4 text-left"
      >
        <div className="w-14 shrink-0 text-center">
          <div
            data-slot="numeric"
            className="text-[18px] font-medium leading-none tracking-[-0.01em] text-foreground"
          >
            {r.d1}
            {r.d2 && <span className="text-muted-foreground/50">–{r.d2}</span>}
          </div>
          <div className="mt-1 text-[10.5px] font-medium uppercase text-muted-foreground/70">
            {r.month}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-medium text-foreground">
            {b.project_title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {statusLabel(b.location_city)}
            </span>
            {b.call_time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeShort(b.call_time)}
              </span>
            )}
            {b.service_type && <span>{b.service_type}</span>}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div data-slot="numeric" className="text-[13.5px] font-medium text-foreground">
            {money(b.talent_fee, b.fee_currency)}
          </div>
          <div className="mt-1 flex justify-end">
            <ToneChip status={b.status} tone={tone} className="text-[11.5px]" />
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200 ease-[var(--ease-out)]",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="slide-up-in pb-6 pl-[4.5rem] pr-8">
          <div className="rounded-xl border border-border bg-card p-5">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11.5px] text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-[13px] font-medium text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {b.notes && (
              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="text-[11.5px] text-muted-foreground">From Candor</div>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">
                  {b.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function Section({ title, bookings, openId, setOpenId, emptyCopy }) {
  return (
    <section className="mt-10 first:mt-0">
      <SectionHead title={title} meta={`${bookings.length}`} className="border-b border-border pb-2.5" />
      {bookings.length === 0 ? (
        <div className="py-10 text-center text-[12.5px] text-muted-foreground">
          {emptyCopy}
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {bookings.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
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
        bookings={upcoming}
        openId={openId}
        setOpenId={setOpenId}
        emptyCopy="No bookings yet — your booker will confirm your first job soon."
      />
      <Section
        title="Past"
        bookings={past}
        openId={openId}
        setOpenId={setOpenId}
        emptyCopy="Nothing in the archive yet."
      />
    </div>
  );
}
