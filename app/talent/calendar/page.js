import { CalendarView } from "@/components/talent/calendar/view";
import { bookings, openCastings, talent } from "@/lib/data";

const ME_ID = "1";

const EXTRA_EVENTS = [
  {
    id: "b-zara-3",
    kind: "confirmed",
    title: "Afropolitan — May issue",
    type: "Editorial",
    location: "Maduka Studio · Lagos",
    time: "Call 7:30am",
    start: "2026-04-24",
    end: "2026-04-24",
    note: "Light, airy mood — mood board on Tuesday.",
  },
  {
    id: "b-zara-1",
    kind: "pending",
    title: "Pepsi Nigeria — TVC",
    type: "TVC",
    location: "Lagos",
    start: "2026-05-01",
    end: "2026-05-03",
    note: "Awaiting countersigned deal memo.",
  },
  {
    id: "b-zara-2",
    kind: "option",
    title: "Vlisco — SS26 campaign",
    type: "Campaign",
    location: "TBC",
    start: "2026-05-18",
    end: "2026-05-19",
    note: "Second-option hold. Answer due 25 Apr.",
  },
  {
    id: "hold-apr29",
    kind: "hold",
    title: "Personal hold — do not book",
    start: "2026-04-29",
    end: "2026-04-29",
    note: "Requested by Zara · family.",
  },
  {
    id: "hold-may12",
    kind: "hold",
    title: "Personal hold",
    start: "2026-05-12",
    end: "2026-05-12",
  },
];

function bookingKind(b) {
  if (b.status === "Confirmed" || b.status === "In Progress") return "confirmed";
  if (b.status === "Option") return "option";
  return "pending";
}

export default function CalendarPage() {
  const me = talent.find((t) => t.id === ME_ID);

  const bookingEvents = bookings
    .filter((b) => b.talentIds?.includes(ME_ID))
    .map((b) => ({
      id: b.id,
      kind: bookingKind(b),
      title: b.client,
      type: b.type,
      location: b.territory,
      start: b.date,
      end: b.endDate || b.date,
    }));

  const castingEvents = openCastings
    .filter((c) =>
      c.interests?.some((i) => i.talentId === ME_ID && i.status === "interested")
    )
    .map((c) => {
      const [start, end] = (c.shootDates || "").split(" to ").map((s) => s.trim());
      return {
        id: c.id,
        kind: "casting",
        title: `${c.workType || "Casting"} — ${c.location || ""}`.trim(),
        type: c.workType,
        location: c.location,
        start: start || c.shootDates,
        end: end || start || c.shootDates,
        note: "You expressed interest — awaiting shortlist.",
      };
    });

  const testShoots = [];
  if (me?.portfolioStatus?.lastTestShoot) {
    testShoots.push({
      id: "test-last",
      kind: "test",
      title: "Test shoot · digitals",
      type: "Portfolio",
      location: "Maduka Studio · Lagos",
      start: me.portfolioStatus.lastTestShoot,
      end: me.portfolioStatus.lastTestShoot,
      note: "Logged in your portfolio.",
    });
  }
  if (me?.portfolioStatus?.nextScheduledShoot) {
    testShoots.push({
      id: "test-next",
      kind: "test",
      title: "Test shoot · scheduled",
      type: "Portfolio refresh",
      location: "Maduka Studio · Lagos",
      start: me.portfolioStatus.nextScheduledShoot,
      end: me.portfolioStatus.nextScheduledShoot,
      note: "Natural light · three angles.",
    });
  }

  const events = [
    ...bookingEvents,
    ...castingEvents,
    ...testShoots,
    ...EXTRA_EVENTS,
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Calendar
        </div>
        <div className="text-[11px] text-muted-foreground">
          Lagos · GMT+1
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Calendar</span>
      </h2>
      <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-muted-foreground">
        Every confirmed job, option, casting and personal hold in one view. Tap a
        day to see what&apos;s on — holds are visible to your booker.
      </p>

      <div className="mt-10">
        <CalendarView events={events} />
      </div>
    </div>
  );
}
