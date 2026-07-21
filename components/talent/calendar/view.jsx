// Server-rendered month grid. All interactivity (month nav) lives in the page
// as links — this component just lays out the days.
import { Clock, MapPin } from "lucide-react";
import { dateShort, statusLabel, timeShort } from "@/lib/format";
import { bookingTone } from "@/components/talent/status-tones";
import { SectionHead } from "@/components/talent/kit";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function eventsOn(bookings, iso) {
  return bookings.filter(
    (b) => b.booking_date <= iso && (b.booking_end_date ?? b.booking_date) >= iso
  );
}

function awayOn(unavailability, iso) {
  return unavailability.find((u) => u.start_date <= iso && u.end_date >= iso);
}

export function CalendarView({
  year,
  month,
  bookings,
  todayISO,
  unavailability = [],
  aside = null,
}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Mon-start

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${pad(month)}-${pad(d)}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const statusesPresent = [...new Set(bookings.map((b) => b.status))];

  return (
    <div>
      {(statusesPresent.length > 0 || unavailability.length > 0) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 text-[11.5px] text-muted-foreground">
          {statusesPresent.map((s) => {
            const tone = bookingTone(s);
            return (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {statusLabel(s)}
              </span>
            );
          })}
          {unavailability.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              Away
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-7 pb-2 text-[11px] font-medium text-muted-foreground/70">
            {WEEK.map((w) => (
              <div key={w} className="text-center">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-border bg-card [&>*]:border-b [&>*]:border-r [&>*]:border-border/50 [&>*:nth-child(7n)]:border-r-0">
            {cells.map((iso, i) => {
              if (!iso) {
                return <div key={`e${i}`} className="min-h-[96px] bg-surface-muted/40" />;
              }
              const dayEvents = eventsOn(bookings, iso);
              const away = awayOn(unavailability, iso);
              const isToday = iso === todayISO;
              const isPast = iso < todayISO;
              const dow = new Date(`${iso}T00:00:00`).getDay();
              const isWeekend = dow === 0 || dow === 6;

              return (
                <div
                  key={iso}
                  className={`relative min-h-[96px] p-2 ${
                    away
                      ? "bg-muted/60"
                      : isWeekend && !isToday
                        ? "bg-surface-muted/40"
                        : ""
                  }`}
                >
                  <span
                    data-slot="numeric"
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] ${
                      isToday
                        ? "bg-brand font-medium text-brand-foreground"
                        : isPast
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                    }`}
                  >
                    {Number(iso.slice(-2))}
                  </span>

                  {away && dayEvents.length === 0 && (
                    <div className="mt-1.5 truncate rounded-md bg-background/60 px-1.5 py-1 text-[10.5px] font-medium text-muted-foreground">
                      Away{away.reason ? ` · ${away.reason}` : ""}
                    </div>
                  )}

                  {dayEvents.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {dayEvents.slice(0, 2).map((b) => {
                        const tone = bookingTone(b.status);
                        return (
                          <div
                            key={b.id}
                            className={`flex items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-1 text-[10.5px] leading-tight ${tone.tint}`}
                          >
                            <span
                              className={`h-2.5 w-[2px] shrink-0 rounded-full ${tone.dot}`}
                            />
                            <span className="truncate font-medium text-foreground/90">
                              {b.project_title}
                            </span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="pl-1 text-[10px] text-muted-foreground/60">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8 lg:col-span-4">
          {aside}
          <div>
          <SectionHead title="This month" className="border-b border-border pb-2.5" />
          <ul className="divide-y divide-border/50">
            {bookings.length === 0 ? (
              <li className="py-8 text-center">
                <p className="text-[13px] font-medium text-foreground">A quiet month</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Nothing booked yet.
                </p>
              </li>
            ) : (
              bookings.map((b) => {
                const tone = bookingTone(b.status);
                const d = new Date(`${b.booking_date}T00:00:00`);
                return (
                  <li key={b.id} className="flex items-start gap-3 py-3">
                    <div className="w-11 shrink-0 text-center">
                      <div
                        data-slot="numeric"
                        className="text-[16px] font-medium leading-none text-foreground"
                      >
                        {d.getDate()}
                      </div>
                      <div className="mt-0.5 text-[10px] font-medium uppercase text-muted-foreground/60">
                        {d.toLocaleString("en-GB", { month: "short" })}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-foreground">
                        {b.project_title}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground">
                        <span className={`inline-flex items-center gap-1 font-medium ${tone.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                          {statusLabel(b.status)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {statusLabel(b.location_city)}
                        </span>
                        {b.call_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {timeShort(b.call_time)}
                          </span>
                        )}
                        {b.booking_end_date &&
                          b.booking_end_date !== b.booking_date && (
                            <span>until {dateShort(b.booking_end_date)}</span>
                          )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
