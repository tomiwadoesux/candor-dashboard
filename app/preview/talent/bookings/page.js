import { TalentFrame } from "@/components/preview/talent-frame";
import { preview } from "@/lib/preview/mock";
import { BookingsList } from "@/components/talent/bookings/list";
import { PageHeader, StatRow, StatTile } from "@/components/talent/kit";
import { dateShort } from "@/lib/format";

export default function Page() {
  const { upcoming, past } = preview.myBookings;
  const total = upcoming.length + past.length;
  const confirmedUpcoming = upcoming.filter((b) => b.status === "confirmed").length;
  const completedCount = past.filter((b) => b.status === "completed").length;
  const next = upcoming[0] ?? null;
  return (
    <TalentFrame>
      <PageHeader title="Bookings" meta={`${total} on record`} />
      <StatRow>
        <StatTile label="Upcoming" value={upcoming.length} />
        <StatTile label="Confirmed" value={confirmedUpcoming} sub="Of your upcoming jobs" />
        <StatTile label="Completed" value={completedCount} sub="All time" />
        <StatTile label="Next job" value={next ? dateShort(next.booking_date) : "—"} sub={next ? next.project_title : "Nothing scheduled"} />
      </StatRow>
      <div className="mt-8">
        <BookingsList upcoming={upcoming} past={past} />
      </div>
    </TalentFrame>
  );
}
