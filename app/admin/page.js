import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { adminDashboardMetrics } from "@/lib/queries/dashboard";
import { dateShort, relativeTime, statusLabel } from "@/lib/format";
import { Eyebrow, Stat, moneyList, bookingAccent, accentText } from "@/components/admin/kit";

const QUICK_ACTIONS = [
  { label: "Add talent", href: "/admin/talent/new" },
  { label: "New booking", href: "/admin/bookings/new" },
  { label: "Post a casting", href: "/admin/casting/new" },
  { label: "Send a message", href: "/admin/communications" },
];

export default async function AdminOverviewPage() {
  const profile = await requireRole("booker", "md", "ceo");
  const metrics = await adminDashboardMetrics();

  const today = new Date();
  const firstName = profile.full_name?.split(" ")[0] || "there";

  const alerts = [
    ...(metrics.escalatedCount > 0
      ? [
          {
            id: "escalated",
            accent: "destructive",
            label: `Escalated — no response`,
            detail: `${metrics.escalatedCount} message${metrics.escalatedCount === 1 ? "" : "s"} past the 10-hour window`,
            href: "/admin/communications?tab=escalated",
          },
        ]
      : []),
    ...metrics.expiringContracts.map((t) => ({
      id: `contract-${t.id}`,
      accent: "warning",
      label: "Contract expiring",
      detail: `${t.first_name} ${t.last_name} · ends ${dateShort(t.contract_end_date)}`,
      href: `/admin/talent/${t.id}`,
    })),
    ...metrics.castingDeadlines.map((c) => ({
      id: `casting-${c.id}`,
      accent: "bronze",
      label: "Casting deadline",
      detail: `${c.title} · closes ${dateShort(c.deadline)}`,
      href: `/admin/casting/${c.id}`,
    })),
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <Eyebrow>
          {today.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Eyebrow>
        <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
          {statusLabel(profile.role)} · Candor Management
        </div>
      </div>
      <h1 className="font-serif text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        The <span className="editorial-italic">board</span>
      </h1>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
        Good to see you, {firstName}. {metrics.bookingsThisMonth} booking
        {metrics.bookingsThisMonth === 1 ? "" : "s"} on the board this month,{" "}
        {alerts.length} item{alerts.length === 1 ? "" : "s"} that need your eye.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat
          label="Active talent"
          value={metrics.activeTalentCount}
          sub="On the roster"
          accent="success"
        />
        <Stat
          label="Bookings · month"
          value={metrics.bookingsThisMonth}
          sub="Booked this calendar month"
        />
        <Stat
          label="Revenue · YTD"
          value={moneyList(metrics.revenueYtd, "—")}
          sub="Gross across currencies"
        />
        <Stat
          label="Pending payouts"
          value={moneyList(metrics.pendingPaymentsNet, "All clear")}
          sub="Net owed to talent"
          accent={Object.keys(metrics.pendingPaymentsNet || {}).length ? "warning" : null}
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h2 className="font-serif text-[22px] font-light text-foreground">
              <span className="editorial-italic">Wire</span> · recent activity
            </h2>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              All bookings <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {metrics.recentActivity.length === 0 && (
              <li className="py-8 text-center text-[12px] text-muted-foreground">
                No activity yet — the wire lights up once bookings start moving.
              </li>
            )}
            {metrics.recentActivity.map((a) => (
              <li key={a.id}>
                <Link
                  href={a.booking ? `/admin/bookings/${a.booking.id}` : "/admin/bookings"}
                  className="group grid grid-cols-12 items-baseline gap-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <span className="col-span-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                    {relativeTime(a.created_at)}
                  </span>
                  <div className="col-span-7 min-w-0">
                    <div className="truncate text-[13px] text-foreground">
                      {a.booking?.project_title || "Booking"}
                      {a.booking?.talent && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {a.booking.talent.first_name} {a.booking.talent.last_name}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                      {a.old_status ? `${statusLabel(a.old_status)} → ` : ""}
                      <span className={accentText(bookingAccent(a.new_status))}>
                        {statusLabel(a.new_status)}
                      </span>
                    </div>
                  </div>
                  <span className="col-span-3 truncate text-right text-[11.5px] text-muted-foreground">
                    {a.changed_by?.full_name || "System"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className="lg:col-span-5">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h2 className="font-serif text-[22px] font-light text-foreground">
              <span className="editorial-italic">Needs you</span>
            </h2>
            <span data-slot="numeric" className="font-mono text-[10px] text-muted-foreground/70">
              {alerts.length} item{alerts.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-border/60">
            {alerts.length === 0 && (
              <li className="py-6 text-center text-[12px] text-muted-foreground">
                Queue is empty — nothing waiting on you.
              </li>
            )}
            {alerts.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="group relative flex items-start gap-3 py-3 pl-3 pr-2 transition-colors hover:bg-muted/40"
                >
                  <span
                    className={`absolute left-0 top-3 h-10 w-[2px] ${
                      p.accent === "destructive"
                        ? "bg-destructive"
                        : p.accent === "warning"
                          ? "bg-warning"
                          : "bg-bronze"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] ${accentText(p.accent)}`}
                    >
                      {p.label}
                    </div>
                    <div className="mt-1 truncate font-serif text-[15px] font-light text-foreground">
                      {p.detail}
                    </div>
                  </div>
                  <ArrowUpRight className="mt-1 h-3 w-3 shrink-0 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-sm border border-border/60 bg-muted/30 p-4">
            <Eyebrow>Quick actions</Eyebrow>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="pressable inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  {q.label}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-20 border-t border-border pt-6">
        <p className="font-serif text-[12.5px] italic text-muted-foreground">
          Candor Management Agency · Lagos · London · USA
        </p>
      </div>
    </div>
  );
}
