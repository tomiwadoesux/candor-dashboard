"use client";

import { analyticsData } from "@/lib/data";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";

function fmtNgn(n) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

const COLORS = {
  revenue: "oklch(64% 0.18 25)",
  commission: "oklch(62% 0.12 260)",
  bookings: "oklch(58% 0.12 145)",
  accent: "oklch(55% 0.2 25)",
  muted: "oklch(68% 0.04 250)",
  sky: "oklch(60% 0.14 235)",
  amber: "oklch(70% 0.16 75)",
  emerald: "oklch(58% 0.14 160)",
  fig: "oklch(50% 0.12 15)",
  violet: "oklch(55% 0.16 300)",
};

const CATEGORY_COLORS = [
  COLORS.fig,
  COLORS.sky,
  COLORS.emerald,
  COLORS.amber,
  COLORS.violet,
  COLORS.muted,
];

export default function AnalyticsAdminPage() {
  const {
    bookingsByMonth,
    revenueByCategory,
    revenueByClient,
    talentPerformance,
    castingMetrics,
    commissionEarned,
  } = analyticsData;

  const totalRevenue = revenueByCategory.reduce((s, c) => s + c.revenue, 0);
  const sortedClients = [...revenueByClient].sort((a, b) => b.revenue - a.revenue);

  const monthData = bookingsByMonth.map((m) => ({
    label: m.month.split(" ")[0],
    values: [m.revenue, Math.round(m.revenue * 0.2)],
  }));

  const categoryData = revenueByCategory.map((c, i) => ({
    label: c.category,
    value: c.revenue,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const clientData = sortedClients.slice(0, 6).map((c) => ({
    label: c.client.split(" ")[0].slice(0, 6),
    values: [c.revenue],
  }));

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Analytics
        </div>
        <div className="text-[11px] text-muted-foreground">
          Last 6 months · through Apr 2026
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        The <span className="editorial-italic">numbers</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        A candid look at the business. What&rsquo;s moving, who&rsquo;s
        earning, where the work is coming from.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat
          label="Revenue · 6mo"
          value={fmtNgn(totalRevenue)}
          sub="+12% vs prior period"
          accent="emerald"
        />
        <Stat
          label="Commission"
          value={fmtNgn(commissionEarned.total)}
          sub={`+${commissionEarned.percentChange}% MoM`}
          accent="emerald"
        />
        <Stat
          label="Fill rate"
          value={`${castingMetrics.conversionRate}%`}
          sub={`${castingMetrics.totalSelections} of ${castingMetrics.totalCastings} filled`}
        />
        <Stat
          label="Time to fill"
          value={castingMetrics.avgTimeToFill}
          sub={`${castingMetrics.avgExpressionsPerCasting} avg interests`}
        />
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Month on month
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
            <Legend color={COLORS.revenue} label="Revenue" />
            <Legend color={COLORS.commission} label="Commission" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <LineChart
            height={260}
            data={monthData}
            series={[
              { key: "rev", label: "Revenue", color: COLORS.revenue, fill: true },
              { key: "com", label: "Commission", color: COLORS.commission },
            ]}
            formatValue={fmtNgn}
          />
        </div>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <div className="flex items-baseline justify-between pb-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              By category
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              Share of revenue
            </span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <DonutChart data={categoryData} size={200} thickness={24} formatValue={fmtNgn} />
          </div>
        </section>

        <section className="lg:col-span-3">
          <div className="flex items-baseline justify-between pb-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              Top clients
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              Revenue · 6mo
            </span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <BarChart
              height={220}
              data={clientData}
              series={[{ key: "rev", label: "Revenue", color: COLORS.fig }]}
              formatValue={fmtNgn}
            />
          </div>
        </section>
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Roster · performance
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Engagement &amp; selection
          </span>
        </div>
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {talentPerformance.map((t, i) => (
            <li key={t.name} className="py-5">
              <div className="grid grid-cols-12 items-start gap-x-4">
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  №{String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-3">
                  <h3 className="font-serif text-[19px] font-light text-foreground">
                    {t.name}
                  </h3>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {t.bookings} booking{t.bookings === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Revenue
                  </div>
                  <div className="mt-0.5 font-serif text-[18px] font-light text-foreground">
                    {fmtNgn(t.revenue)}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Engagement
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/40">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-out"
                        style={{ width: `${t.engagementRate}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      {t.engagementRate}%
                    </span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Selection
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/40">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-[width] duration-700 ease-out"
                        style={{ width: `${t.selectionRate}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      {t.selectionRate}%
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-1.5 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function Stat({ label, value, sub, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "amber"
      ? "text-amber-700 dark:text-amber-400"
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
