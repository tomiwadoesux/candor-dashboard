// Server-rendered month grid. All interactivity (month nav) lives in the page
// as links — this component just lays out the days.
import { Clock, MapPin } from "lucide-react";
import { dateShort, statusLabel, timeShort } from "@/lib/format";
import { bookingTone } from "@/components/talent/status-tones";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function eventsOn(bookings, iso) {
  return bookings.filter(
    (b) => b.booking_date <= iso && (b.booking_end_date ?? b.booking_date) >= iso
  );
}

export function CalendarView({ year, month, bookings, todayISO }) {
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
      {statusesPresent.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-5 text-[10.5px] text-muted-foreground">
          {statusesPresent.map((s) => {
            const tone = bookingTone(s);
            return (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                <span className="uppercase tracking-[0.12em]">
                  {statusLabel(s)}
                </span>
              </span>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-7 border-b border-border/60 pb-2 text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/60">
            {WEEK.map((w) => (
              <div key={w} className="text-center font-medium">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-sm border border-border/50 [&>*]:border-b [&>*]:border-r [&>*]:border-border/40 [&>*:nth-child(7n)]:border-r-0">
            {cells.map((iso, i) => {
              if (!iso) {
                return <div key={`e${i}`} className="min-h-[104px] bg-muted/15" />;
              }
              const dayEvents = eventsOn(bookings, iso);
              const isToday = iso === todayISO;
              const isPast = iso < todayISO;
              const dow = new Date(`${iso}T00:00:00`).getDay();
              const isWeekend = dow === 0 || dow === 6;

              return (
                <div
                  key={iso}
                  className={`relative min-h-[104px] p-2.5 ${
                    isToday
                      ? "bg-bronze/[0.06]"
                      : isWeekend
                        ? "bg-muted/20"
                        : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`font-serif leading-none ${
                        isToday ? "text-[24px] font-light" : "text-[16px] font-light"
                      } ${isPast && !isToday ? "text-muted-foreground/50" : "text-foreground"}`}
                    >
                      {Number(iso.slice(-2))}
                    </span>
                    {isToday && (
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-bronze">
                        Today
                      </span>
                    )}
                  </div>

                  {dayEvents.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 2).map((b) => {
                        const tone = bookingTone(b.status);
                        return (
                          <div
                            key={b.id}
                            className={`flex items-center gap-1 overflow-hidden rounded-[3px] px-1.5 py-1 text-[10px] leading-tight ${tone.tint} ring-1 ${tone.ring} ring-inset`}
                          >
                            <span
                              className={`w-[2px] self-stretch rounded-sm ${tone.dot}`}
                              style={{ minHeight: 10 }}
                            />
                            <span className="truncate font-medium text-foreground/85">
                              {b.project_title}
                            </span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="pl-1 font-mono text-[9px] text-muted-foreground/60">
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

        <div className="lg:col-span-4">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h4 className="font-serif text-[16px] font-light text-foreground">
              <span className="editorial-italic">This month</span>
            </h4>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/60">
              Chronological
            </span>
          </div>
          <ul className="mt-2 divide-y divide-border/40">
            {bookings.length === 0 ? (
              <li className="py-8 text-center">
                <p className="font-serif text-[14px] italic text-muted-foreground">
                  A quiet month.
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  No bookings yet — your booker will confirm your first job soon.
                </p>
              </li>
            ) : (
              bookings.map((b) => {
                const tone = bookingTone(b.status);
                const d = new Date(`${b.booking_date}T00:00:00`);
                return (
                  <li key={b.id} className="flex items-start gap-3 py-3">
                    <div className="w-12 shrink-0 text-center">
                      <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground/60">
                        {d.toLocaleString("en-GB", { month: "short" })}
                      </div>
                      <div
                        data-slot="numeric"
                        className="font-serif text-[22px] font-light leading-none text-foreground"
                      >
                        {d.getDate()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em]">
                        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                        <span className={tone.text}>{statusLabel(b.status)}</span>
                      </div>
                      <div className="mt-0.5 truncate font-serif text-[14px] font-light text-foreground">
                        {b.project_title}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {statusLabel(b.location_city)}
                        </span>
                        {b.call_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            Call {timeShort(b.call_time)}
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
  );
}
