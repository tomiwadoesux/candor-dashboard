import { ClientsList } from "@/components/admin/clients-list";
import { clients } from "@/lib/data";

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

function fmtNgn(n) {
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦ ${(n / 1_000).toFixed(0)}K`;
  return `₦ ${n}`;
}

export default function ClientsAdminPage() {
  const active = clients.filter((c) => c.status === "Active").length;
  const established = clients.filter((c) => c.clientType === "Established").length;
  const totalBookings = clients.reduce((s, c) => s + c.totalBookings, 0);
  const outstanding = clients.reduce(
    (s, c) => s + parseMoney(c.outstanding),
    0
  );

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Clients
        </div>
        <div className="text-[11px] text-muted-foreground">
          {clients.length} on file
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Clients</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Everyone who books Candor talent — brands, fashion houses, editorial
        desks. Contact details, payment terms and outstanding balances in one
        view.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="On file" value={clients.length} sub={`${established} established`} />
        <Stat label="Active" value={active} sub="Booking this year" accent="emerald" />
        <Stat
          label="Lifetime bookings"
          value={totalBookings}
          sub="Across the roster"
        />
        <Stat
          label="Outstanding"
          value={fmtNgn(outstanding)}
          sub={outstanding > 0 ? "Across 3 clients" : "All clear"}
          accent={outstanding > 0 ? "rose" : null}
        />
      </div>

      <div className="mt-10">
        <ClientsList clients={clients} />
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
