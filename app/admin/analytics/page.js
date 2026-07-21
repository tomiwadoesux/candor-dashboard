import { requireRole } from "@/lib/auth";
import { paymentSummary } from "@/lib/queries/payments";
import { listCastingAnalytics } from "@/lib/queries/talent";
import { adminDashboardMetrics } from "@/lib/queries/dashboard";
import { PageIntro, Stat, moneyList } from "@/components/admin/kit";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export default async function AnalyticsAdminPage() {
  await requireRole("md", "ceo");

  const [summary, castingAnalytics, metrics] = await Promise.all([
    paymentSummary(),
    listCastingAnalytics(),
    adminDashboardMetrics(),
  ]);

  const pipeline = [
    { label: "Awaiting client", status: "awaiting_client_payment", count: summary.awaiting.count },
    { label: "Client paid", status: "client_paid", count: summary.clientPaid.count },
    { label: "Talent paid", status: "talent_paid", count: summary.talentPaid.count },
  ];

  return (
    <div>
      <PageIntro
        eyebrow="Business · Analytics"
        meta="MD & CEO only"
        title={
          <>
            The numbers
          </>
        }
        lede="A candid look at the business. What's moving, who's earning, where the work is coming from — straight from the live ledger."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat
          label="Revenue · YTD"
          value={moneyList(summary.ytdRevenue, "—")}
          sub="Gross this calendar year"
          accent="success"
        />
        <Stat
          label="Commission · YTD"
          value={moneyList(summary.ytdCommission, "—")}
          sub="Agency share"
          accent="brand"
        />
        <Stat
          label="Active talent"
          value={metrics.activeTalentCount}
          sub={`${metrics.bookingsThisMonth} bookings this month`}
        />
        <Stat
          label="Pending payouts"
          value={moneyList(metrics.pendingPaymentsNet, "All clear")}
          sub="Net owed to talent"
          accent={Object.keys(metrics.pendingPaymentsNet || {}).length ? "warning" : null}
        />
      </div>

      <AnalyticsCharts
        pipeline={pipeline}
        ytdRevenue={summary.ytdRevenue}
        ytdCommission={summary.ytdCommission}
        castingAnalytics={castingAnalytics}
      />

      <section className="mt-12">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[11.5px] font-medium text-muted-foreground/70">
            Roster · casting performance
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Interest &amp; selection
          </span>
        </div>
        {castingAnalytics.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-muted-foreground">
            No casting responses yet — analytics appear once talent start raising their hands.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {castingAnalytics.map((t, i) => (
              <li key={t.talent_id} className="py-5">
                <div className="grid grid-cols-12 items-start gap-x-4">
                  <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                    №{String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-[13.5px] font-medium text-foreground">
                      {t.first_name} {t.last_name}
                    </h3>
                    <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground/70">
                      {t.category}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-[11.5px] font-medium text-muted-foreground/70">
                      Responses
                    </div>
                    <div
                      data-slot="numeric"
                      className="mt-0.5 text-[13.5px] font-medium text-foreground"
                    >
                      {t.responses_count}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-[11.5px] font-medium text-muted-foreground/70">
                      Interested
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/40">
                        <div
                          className="h-full rounded-full bg-brand transition-[width] duration-200 ease-out"
                          style={{
                            width: `${
                              t.responses_count
                                ? Math.round((t.interests_count / t.responses_count) * 100)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span
                        data-slot="numeric"
                        className="font-mono text-[10.5px] text-muted-foreground"
                      >
                        {t.interests_count}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-[11.5px] font-medium text-muted-foreground/70">
                      Selection rate
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/40">
                        <div
                          className="h-full rounded-full bg-success transition-[width] duration-200 ease-out"
                          style={{ width: `${Math.min(100, t.selection_rate_pct ?? 0)}%` }}
                        />
                      </div>
                      <span
                        data-slot="numeric"
                        className="font-mono text-[10.5px] text-muted-foreground"
                      >
                        {t.selection_rate_pct ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
