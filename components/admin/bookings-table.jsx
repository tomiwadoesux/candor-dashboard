// Server component — the status filter is searchParams-driven; rows link to
// the booking detail page.

import Link from "next/link";
import { Check, Clock, MapPin } from "lucide-react";
import { money, statusLabel } from "@/lib/format";
import { StatusPill, bookingAccent, EmptyRow } from "@/components/admin/kit";

const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending", label: "Pending" },
  { id: "casting_sent", label: "Casting sent" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function fmtRange(start, end) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end || start}T00:00:00`);
  const sameDay = s.getTime() === e.getTime();
  const sameMonth = s.getMonth() === e.getMonth();
  const month = s.toLocaleString("en-GB", { month: "short" });
  if (sameDay) return { d: s.getDate(), month, year: s.getFullYear() };
  if (sameMonth)
    return { d: `${s.getDate()}–${e.getDate()}`, month, year: s.getFullYear() };
  return {
    d: `${s.getDate()}–${e.getDate()}`,
    month: `${month}–${e.toLocaleString("en-GB", { month: "short" })}`,
    year: s.getFullYear(),
  };
}

export function BookingsTable({ bookings, status = "" }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.id;
          return (
            <Link
              key={f.id || "all"}
              href={f.id ? `/admin/bookings?status=${f.id}` : "/admin/bookings"}
              className={`pressable inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {bookings.map((b, i) => {
          const r = fmtRange(b.booking_date, b.booking_end_date);
          return (
            <li key={b.id}>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="group relative grid w-full grid-cols-12 items-start gap-x-4 py-5 text-left transition-colors hover:bg-muted/30"
              >
                {b.status === "confirmed" && (
                  <span className="absolute left-0 top-5 h-10 w-[2px] bg-success" />
                )}
                <div className="col-span-2 flex flex-col pl-4">
                  <span
                    data-slot="numeric"
                    className="text-[22px] font-semibold tracking-[-0.02em] leading-none tracking-[-0.02em] text-foreground"
                  >
                    {r.d}
                  </span>
                  <span className="mt-1 font-mono text-[10.5px] text-muted-foreground">
                    {r.month} · {r.year}
                  </span>
                </div>
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-6 min-w-0">
                  <h3 className="truncate text-[13.5px] font-medium text-foreground">
                    {b.project_title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {b.service_type && (
                      <span className="">{b.service_type}</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {statusLabel(b.location_city)}
                    </span>
                    {b.media_usage && <span>{b.media_usage}</span>}
                    {b.pre_job_brief_sent ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <Check className="h-3 w-3" />
                        Brief sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning">
                        <Clock className="h-3 w-3" />
                        Brief pending
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-muted-foreground/80">
                    {b.talent
                      ? `${b.talent.first_name} ${b.talent.last_name}`
                      : "Unassigned"}
                    {b.client ? ` · ${b.client.company_name}` : ""}
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <div
                    data-slot="numeric"
                    className="text-[13.5px] font-medium text-foreground"
                  >
                    {money(b.talent_fee, b.fee_currency)}
                  </div>
                  <div className="mt-1">
                    <StatusPill status={b.status} accent={bookingAccent(b.status)} />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {bookings.length === 0 && (
          <EmptyRow>
            No bookings yet —{" "}
            <Link
              href="/admin/bookings/new"
              className="underline transition-colors hover:text-foreground"
            >
              create the first one
            </Link>
            .
          </EmptyRow>
        )}
      </ul>
    </>
  );
}
