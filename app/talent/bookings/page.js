import { BookingsList } from "@/components/talent/bookings/list";
import { bookings } from "@/lib/data";

const ME_ID = "1";

const FUTURE_BOOKINGS = [
  {
    id: "b-zara-1",
    client: "Pepsi Nigeria",
    clientId: "c4",
    talent: "Zara",
    talentIds: [ME_ID],
    type: "TVC",
    date: "2026-05-01",
    endDate: "2026-05-03",
    status: "Pending",
    value: "NGN 2,400,000",
    currency: "NGN",
    mediaUsage: "TV, digital, social",
    territory: "West Africa",
    usageTerm: "24 months",
    dealMemo: false,
    milestoneOptIn: false,
    createdAt: "2026-04-18",
    brief:
      "High-energy three-day shoot. Wardrobe courtesy of production. Call sheets will follow once the deal memo is countersigned.",
  },
  {
    id: "b-zara-2",
    client: "Vlisco",
    clientId: "c6",
    talent: "Zara",
    talentIds: [ME_ID],
    type: "Campaign",
    date: "2026-05-18",
    endDate: "2026-05-19",
    status: "Option",
    value: "NGN 1,500,000",
    currency: "NGN",
    mediaUsage: "Print, digital, OOH",
    territory: "Pan-African",
    usageTerm: "12 months",
    dealMemo: false,
    milestoneOptIn: false,
    createdAt: "2026-04-15",
    brief:
      "Second-option hold for the SS26 campaign. We'll hear back from Vlisco's team by April 25. Nothing to action yet.",
  },
  {
    id: "b-zara-3",
    client: "Afropolitan",
    clientId: "c7",
    talent: "Zara",
    talentIds: [ME_ID],
    type: "Editorial",
    date: "2026-04-24",
    endDate: "2026-04-24",
    status: "Confirmed",
    value: "NGN 550,000",
    currency: "NGN",
    mediaUsage: "Print, digital",
    territory: "Africa",
    usageTerm: "6 months",
    dealMemo: true,
    milestoneOptIn: true,
    createdAt: "2026-04-10",
    brief:
      "One-day editorial for the May issue. Call time 7:30am at Maduka studio. Light, airy mood — Tomi will share the mood board on Tuesday.",
  },
];

export default function BookingsPage() {
  const mine = bookings.filter((b) => b.talentIds?.includes(ME_ID));
  const all = [...mine, ...FUTURE_BOOKINGS];

  const confirmedCount = all.filter((b) => b.status === "Confirmed").length;
  const pendingCount = all.filter(
    (b) => b.status === "Pending" || b.status === "Option"
  ).length;
  const grossYtd = 4240000;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Bookings
        </div>
        <div className="text-[11px] text-muted-foreground">
          {all.length} on record
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Bookings</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        Every confirmed job, option and brief. Tap any row to see the deal terms —
        queries still go through Communications.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <HeroStat label="Confirmed" value={confirmedCount} sub="Across 2026" />
        <HeroStat
          label="Options"
          value={pendingCount}
          sub="Awaiting client / deal memo"
        />
        <HeroStat
          label="Gross YTD"
          value={`₦ ${(grossYtd / 1_000_000).toFixed(2)}M`}
          sub="Before commission"
        />
        <HeroStat
          label="Next job"
          value="24 Apr"
          sub="Afropolitan · editorial"
        />
      </div>

      <div className="mt-10">
        <BookingsList bookings={all} />
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
      <div className="mt-2 font-serif text-[30px] font-light tracking-[-0.02em] text-foreground">
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
