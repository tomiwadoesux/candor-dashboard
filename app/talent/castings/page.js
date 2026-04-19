import { CastingBoard } from "@/components/talent/castings/board";
import { openCastings, bookings } from "@/lib/data";

const TALENT_ID = "1";

export default function CastingsPage() {
  const myBookings = bookings
    .filter((b) => b.talentIds?.includes(TALENT_ID))
    .map((b) => ({ date: b.date, endDate: b.endDate, client: b.client, type: b.type }));

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Community · Open briefs
        </div>
        <div className="text-[11px] text-muted-foreground">
          {openCastings.filter((c) => c.status === "Open").length} open
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Castings</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        Briefs are anonymised until you're shortlisted. Tap interest before the deadline —
        we check your calendar for you.
      </p>

      <div className="mt-8">
        <CastingBoard castings={openCastings} myBookings={myBookings} />
      </div>
    </div>
  );
}
