import { CastingBoard } from "@/components/admin/casting-board";
import { openCastings, talent } from "@/lib/data";

const TODAY = new Date("2026-04-18T00:00:00");

export default function CastingAdminPage() {
  const total = openCastings.length;
  const open = openCastings.filter((c) => c.status === "Open").length;
  const closed = total - open;
  const totalInterests = openCastings.reduce(
    (s, c) => s + (c.interests?.length || 0),
    0
  );
  const totalSelected = openCastings.reduce(
    (s, c) => s + (c.selected?.length || 0),
    0
  );
  const urgent = openCastings.filter((c) => {
    if (c.status !== "Open") return false;
    const d = Math.round(
      (new Date(`${c.deadline}T00:00:00`) - TODAY) / 86400000
    );
    return d >= 0 && d <= 3;
  }).length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Casting
        </div>
        <div className="text-[11px] text-muted-foreground">
          {total} brief{total === 1 ? "" : "s"} on the wall
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        Casting <span className="editorial-italic">&amp; selection</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Live briefs from clients — where interest becomes a shortlist, and a
        shortlist becomes a booking. Tap a brief to see who&rsquo;s in and
        who&rsquo;s picked.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-5">
        <Stat label="Open" value={open} sub="Accepting interest" accent="emerald" />
        <Stat
          label="Closing soon"
          value={urgent}
          sub="Within 3 days"
          accent={urgent > 0 ? "rose" : null}
        />
        <Stat label="Closed" value={closed} sub="Decision made" />
        <Stat label="Expressions" value={totalInterests} sub="Across the board" />
        <Stat
          label="Picked"
          value={totalSelected}
          sub="Moving to booking"
          accent={totalSelected > 0 ? "emerald" : null}
        />
      </div>

      <div className="mt-10">
        <CastingBoard castings={openCastings} talent={talent} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "rose"
      ? "text-rose-700 dark:text-rose-400"
      : "text-foreground";
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        className={`mt-2 font-serif text-[28px] font-light leading-none tracking-[-0.02em] ${color}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
