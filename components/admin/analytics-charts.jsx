"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";

// Mixed currencies share one axis, so ticks are plain compact numbers.
const compact = new Intl.NumberFormat("en", { notation: "compact" });

// Chart tokens from globals.css — never raw palette values.
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// The payment pipeline is status data, so it wears the status tokens.
const PIPELINE_COLORS = {
  awaiting_client_payment: "var(--warning)",
  client_paid: "var(--chart-1)",
  talent_paid: "var(--success)",
};

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function ChartHeader({ title, children }) {
  return (
    <div className="flex items-baseline justify-between pb-3">
      <h2 className="text-[13px] font-medium text-foreground">{title}</h2>
      {children && (
        <div className="flex items-center gap-4 text-[11.5px] text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

export function AnalyticsCharts({
  pipeline = [],
  ytdRevenue = {},
  ytdCommission = {},
  castingAnalytics = [],
}) {
  const pipelineData = pipeline.map((p, i) => ({
    label: p.label,
    value: p.count,
    color: PIPELINE_COLORS[p.status] ?? CHART_COLORS[i % CHART_COLORS.length],
  }));
  const hasPipeline = pipeline.some((p) => p.count > 0);

  const currencies = Array.from(
    new Set([...Object.keys(ytdRevenue), ...Object.keys(ytdCommission)])
  );
  const revenueData = currencies.map((cur) => ({
    label: cur,
    values: [ytdRevenue[cur] || 0, ytdCommission[cur] || 0],
  }));

  const topCasting = castingAnalytics.slice(0, 6).map((t) => ({
    label: `${t.first_name} ${(t.last_name || "").slice(0, 1)}.`,
    values: [t.interests_count || 0, t.selected_count || 0],
  }));

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
      <section className="lg:col-span-2">
        <ChartHeader title="Payment pipeline" />
        <div className="rounded-xl border border-border bg-card p-5">
          {hasPipeline ? (
            <DonutChart
              data={pipelineData}
              size={190}
              thickness={22}
              formatValue={(v) => `${v}`}
            />
          ) : (
            <p className="py-12 text-center text-[12.5px] text-muted-foreground">
              No payments yet — the pipeline fills in as bookings invoice.
            </p>
          )}
        </div>
      </section>

      <section className="lg:col-span-3">
        <ChartHeader title="Year to date, by currency">
          <Legend color={CHART_COLORS[0]} label="Revenue" />
          <Legend color={CHART_COLORS[1]} label="Commission" />
        </ChartHeader>
        <div className="rounded-xl border border-border bg-card p-5">
          {revenueData.length > 0 ? (
            <BarChart
              height={220}
              data={revenueData}
              series={[
                { key: "rev", label: "Revenue", color: CHART_COLORS[0] },
                { key: "com", label: "Commission", color: CHART_COLORS[1] },
              ]}
              formatValue={(v) => compact.format(v)}
            />
          ) : (
            <p className="py-12 text-center text-[12.5px] text-muted-foreground">
              No revenue recorded this year yet.
            </p>
          )}
        </div>
      </section>

      {topCasting.length > 0 && (
        <section className="lg:col-span-5">
          <ChartHeader title="Casting engagement — top talent">
            <Legend color={CHART_COLORS[0]} label="Interested" />
            <Legend color={CHART_COLORS[1]} label="Selected" />
          </ChartHeader>
          <div className="rounded-xl border border-border bg-card p-5">
            <BarChart
              height={220}
              data={topCasting}
              series={[
                { key: "int", label: "Interested", color: CHART_COLORS[0] },
                { key: "sel", label: "Selected", color: CHART_COLORS[1] },
              ]}
              formatValue={(v) => `${v}`}
            />
          </div>
        </section>
      )}
    </div>
  );
}
