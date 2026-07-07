import { BookingsList } from "@/components/talent/bookings/list";
import { myBookingsSplit } from "@/lib/queries/bookings";
import { dateShort } from "@/lib/format";

export default async function BookingsPage() {
  const { upcoming, past } = await myBookingsSplit();
  const total = upcoming.length + past.length;

  const confirmedUpcoming = upcoming.filter((b) => b.status === "confirmed").length;
  const completedCount = past.filter((b) => b.status === "completed").length;
  const next = upcoming[0] ?? null;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Bookings
        </div>
        <div className="text-[11px] text-muted-foreground">
          {total} on record
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Bookings</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        Every job on your books. Tap any row to see the deal terms — queries go
        through Communications.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <HeroStat label="Upcoming" value={upcoming.length} sub="On the calendar" />
        <HeroStat
          label="Confirmed"
          value={confirmedUpcoming}
          sub="Of your upcoming jobs"
        />
        <HeroStat label="Completed" value={completedCount} sub="All time" />
        <HeroStat
          label="Next job"
          value={next ? dateShort(next.booking_date) : "—"}
          sub={next ? next.project_title : "Nothing scheduled"}
        />
      </div>

      <div className="mt-10">
        <BookingsList upcoming={upcoming} past={past} />
      </div>
    </div>
  );
}

function HeroStat({ label, value, sub }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div
        data-slot="numeric"
        className="mt-2 font-serif text-[30px] font-light tracking-[-0.02em] text-foreground"
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 truncate text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
