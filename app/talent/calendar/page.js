import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { myBookingsInRange } from "@/lib/queries/bookings";
import { CalendarView } from "@/components/talent/calendar/view";

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
  const bookings = await myBookingsInRange(monthStart, monthEnd);

  const prev = month === 1 ? ym(year - 1, 12) : ym(year, month - 1);
  const next = month === 12 ? ym(year + 1, 1) : ym(year, month + 1);
  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-GB", {
    month: "long",
  });

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Calendar
        </div>
        <div className="text-[11px] text-muted-foreground">
          {bookings.length} booking{bookings.length === 1 ? "" : "s"} this month
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Calendar</span>
      </h2>
      <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-muted-foreground">
        Your bookings, month by month. Colour tells you where each job stands —
        confirmed, pending, or done.
      </p>

      <div className="mt-10 flex items-end justify-between border-b border-border/60 pb-5">
        <h3 className="font-serif text-[44px] font-light leading-[0.95] tracking-[-0.02em] text-foreground">
          <span className="editorial-italic">{monthName}</span>
          <span className="ml-3 text-muted-foreground/50">{year}</span>
        </h3>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/talent/calendar?month=${prev}`}
            aria-label="Previous month"
            className="pressable grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/talent/calendar"
            className="pressable flex h-9 items-center rounded-full border border-border/60 px-4 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            Today
          </Link>
          <Link
            href={`/talent/calendar?month=${next}`}
            aria-label="Next month"
            className="pressable grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <CalendarView
          year={year}
          month={month}
          bookings={bookings}
          todayISO={todayISO}
        />
      </div>
    </div>
  );
}
