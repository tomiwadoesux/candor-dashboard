import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { adminDashboardMetrics } from "@/lib/queries/dashboard";
import { dateShort, relativeTime, statusLabel } from "@/lib/format";
import {
  Stat,
  moneyList,
  bookingAccent,
  accentText,
} from "@/components/admin/kit";
import { QUICK_ACTIONS } from "@/components/admin/nav-config";

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
            label: "Escalated — no response",
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
      accent: "brand",
      label: "Casting deadline",
      detail: `${c.title} · closes ${dateShort(c.deadline)}`,
      href: `/admin/casting/${c.id}`,
    })),
  ];

  return (
    <div>
      <div className="flex items-end justify-between gap-4 pb-6">
        <div>
          <h1 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
            Good to see you, <span className="editorial-italic font-normal">{firstName}</span>
          </h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {today.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {" · "}
            {alerts.length > 0
              ? `${alerts.length} item${alerts.length === 1 ? "" : "s"} need your eye`
              : "nothing waiting on you"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Active talent" value={metrics.activeTalentCount} />
        <Stat label="Bookings this month" value={metrics.bookingsThisMonth} />
        <Stat label="Revenue YTD" value={moneyList(metrics.revenueYtd, "—")} />
        <Stat
          label="Pending payouts"
          value={moneyList(metrics.pendingPaymentsNet, "All clear")}
          accent={
            Object.keys(metrics.pendingPaymentsNet || {}).length ? "warning" : null
          }
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-baseline justify-between border-b border-border pb-2.5">
            <h2 className="text-[13px] font-medium text-foreground">Recent activity</h2>
            <Link
              href="/admin/bookings"
              className="text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
            >
              All bookings
            </Link>
          </div>
          <ul className="divide-y divide-border/60">
            {metrics.recentActivity.length === 0 && (
              <li className="py-8 text-center text-[12.5px] text-muted-foreground">
                No activity yet — this lights up once bookings start moving.
              </li>
            )}
            {metrics.recentActivity.map((a) => (
              <li key={a.id}>
                <Link
                  href={a.booking ? `/admin/bookings/${a.booking.id}` : "/admin/bookings"}
                  className="hover-reveal group flex items-center gap-4 rounded-md px-2 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {a.booking?.project_title || "Booking"}
                      {a.booking?.talent && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {a.booking.talent.first_name} {a.booking.talent.last_name}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {a.old_status ? `${statusLabel(a.old_status)} → ` : ""}
                      <span className={`font-medium ${accentText(bookingAccent(a.new_status))}`}>
                        {statusLabel(a.new_status)}
                      </span>
                      <span className="text-muted-foreground/60">
                        {" "}
                        · {a.changed_by?.full_name || "System"}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground/60">
                    {relativeTime(a.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className="lg:col-span-5">
          <div className="flex items-baseline justify-between border-b border-border pb-2.5">
            <h2 className="text-[13px] font-medium text-foreground">Needs you</h2>
            <span data-slot="numeric" className="text-[12px] text-muted-foreground">
              {alerts.length}
            </span>
          </div>
          <ul className="divide-y divide-border/60">
            {alerts.length === 0 && (
              <li className="py-8 text-center text-[12.5px] text-muted-foreground">
                Queue is empty.
              </li>
            )}
            {alerts.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="hover-reveal group relative flex items-start gap-3 rounded-md py-3 pl-3 pr-2"
                >
                  <span
                    className={`absolute left-0 top-1/2 h-8 w-[2.5px] -translate-y-1/2 rounded-full ${
                      p.accent === "destructive"
                        ? "bg-destructive"
                        : p.accent === "warning"
                          ? "bg-warning"
                          : "bg-brand"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`text-[11.5px] font-medium ${accentText(p.accent)}`}>
                      {p.label}
                    </div>
                    <div className="mt-0.5 truncate text-[13px] font-medium text-foreground">
                      {p.detail}
                    </div>
                  </div>
                  <ArrowUpRight className="mt-1 h-3 w-3 shrink-0 text-muted-foreground/40 transition-[transform,color] duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="pressable inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
              >
                {q.title}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
