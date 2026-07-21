import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { myBookingsInRange } from "@/lib/queries/bookings";
import { myUnavailability } from "@/lib/queries/availability";
import { CalendarView } from "@/components/talent/calendar/view";
import { OutDates } from "@/components/talent/calendar/out-dates";
import { PageHeader } from "@/components/talent/kit";

function pad(n) {
  return String(n).padStart(2, "0");
}

function ym(year, month) {
  return `${year}-${pad(month)}`;
}

export default async function CalendarPage({ searchParams }) {
  const { month: monthParam } = await searchParams;

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // 1-based
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam ?? "")) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m;
  }

  const lastDay = new Date(year, month, 0).getDate();
  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(lastDay)}`;
  const [bookings, unavailability] = await Promise.all([
    myBookingsInRange(monthStart, monthEnd),
    myUnavailability(),
  ]);
  const monthAway = unavailability.filter(
    (u) => u.start_date <= monthEnd && u.end_date >= monthStart
  );

  const prev = month === 1 ? ym(year - 1, 12) : ym(year, month - 1);
  const next = month === 12 ? ym(year + 1, 1) : ym(year, month + 1);
  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-GB", {
    month: "long",
  });

  return (
    <div>
      <PageHeader
        title="Calendar"
        meta={`${bookings.length} booking${bookings.length === 1 ? "" : "s"} this month`}
        action={
          <div className="flex items-center gap-1">
            <Link
              href={`/talent/calendar?month=${prev}`}
              aria-label="Previous month"
              className="pressable grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/talent/calendar"
              className="pressable flex h-8 items-center rounded-lg border border-border px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              Today
            </Link>
            <Link
              href={`/talent/calendar?month=${next}`}
              aria-label="Next month"
              className="pressable grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      <div className="flex items-baseline gap-2 pb-4">
        <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-foreground">
          {monthName}
        </h2>
        <span className="text-[20px] font-light text-muted-foreground/60">{year}</span>
      </div>

      <CalendarView
        year={year}
        month={month}
        bookings={bookings}
        todayISO={todayISO}
        unavailability={monthAway}
        aside={<OutDates entries={unavailability} />}
      />
    </div>
  );
}
