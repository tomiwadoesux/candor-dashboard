import { TalentFrame } from "@/components/preview/talent-frame";
import { preview } from "@/lib/preview/mock";
import { CalendarView } from "@/components/talent/calendar/view";
import { PageHeader } from "@/components/talent/kit";

export default function Page() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const pad = (n) => String(n).padStart(2, "0");
  const todayISO = `${year}-${pad(month)}-${pad(now.getDate())}`;
  const monthName = now.toLocaleString("en-GB", { month: "long" });
  const bookings = preview.bookings.filter(
    (b) => (b.booking_end_date ?? b.booking_date).slice(0, 7) === `${year}-${pad(month)}` ||
           b.booking_date.slice(0, 7) === `${year}-${pad(month)}`
  );

  return (
    <TalentFrame>
      <PageHeader title="Calendar" meta={`${bookings.length} booking${bookings.length === 1 ? "" : "s"} this month`} />
      <div className="flex items-baseline gap-2 pb-4">
        <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-foreground">{monthName}</h2>
        <span className="text-[20px] font-light text-muted-foreground/60">{year}</span>
      </div>
      <CalendarView year={year} month={month} bookings={bookings} todayISO={todayISO} />
    </TalentFrame>
  );
}
