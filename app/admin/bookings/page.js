import { BookingsTable } from "@/components/admin/bookings-table";
import { bookings } from "@/lib/data";

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

function fmtNgn(n) {
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦ ${(n / 1_000).toFixed(0)}K`;
  return `₦ ${n}`;
}

export default function BookingsAdminPage() {
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const inProgress = bookings.filter((b) => b.status === "In Progress").length;
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const casting = bookings.filter((b) => b.status === "Casting").length;
  const gross = bookings.reduce((s, b) => s + parseMoney(b.value), 0);
  const unsigned = bookings.filter((b) => !b.dealMemo).length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Bookings
        </div>
        <div className="text-[11px] text-muted-foreground">
          {bookings.length} on record
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Bookings</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Every live, confirmed and pending job across the roster. Tap a row for
        deal terms — unsigned memos are flagged inline.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-5">
        <Stat label="Confirmed" value={confirmed} sub="Signed off" accent="emerald" />
        <Stat label="Live" value={inProgress} sub="On set now" accent="amber" />
        <Stat label="Pending" value={pending} sub="Awaiting deal memo" />
        <Stat label="Casting" value={casting} sub="Out to talent" accent="sky" />
        <Stat
          label="Gross pipeline"
          value={fmtNgn(gross)}
          sub={`${unsigned} memos outstanding`}
        />
      </div>

      <div className="mt-10">
        <BookingsTable bookings={bookings} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "amber"
      ? "text-amber-700 dark:text-amber-400"
      : accent === "sky"
      ? "text-sky-700 dark:text-sky-400"
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
