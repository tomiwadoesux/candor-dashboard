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

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
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
    color: CHART_COLORS[i % CHART_COLORS.length],
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
    <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-5">
      <section className="lg:col-span-2">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Payment pipeline
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Count by status
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          {hasPipeline ? (
            <DonutChart
              data={pipelineData}
              size={200}
              thickness={24}
              formatValue={(v) => `${v}`}
            />
          ) : (
            <p className="py-12 text-center text-[12px] text-muted-foreground">
              No payments yet — the pipeline fills in as bookings invoice.
            </p>
          )}
        </div>
      </section>

      <section className="lg:col-span-3">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Year to date · by currency
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
            <Legend color={CHART_COLORS[0]} label="Revenue" />
            <Legend color={CHART_COLORS[1]} label="Commission" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
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
            <p className="py-12 text-center text-[12px] text-muted-foreground">
              No revenue recorded this year yet.
            </p>
          )}
        </div>
      </section>

      {topCasting.length > 0 && (
        <section className="lg:col-span-5">
          <div className="flex items-baseline justify-between pb-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              Casting engagement · top talent
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
              <Legend color={CHART_COLORS[2]} label="Interested" />
              <Legend color={CHART_COLORS[3]} label="Selected" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <BarChart
              height={220}
              data={topCasting}
              series={[
                { key: "int", label: "Interested", color: CHART_COLORS[2] },
                { key: "sel", label: "Selected", color: CHART_COLORS[3] },
              ]}
              formatValue={(v) => `${v}`}
            />
          </div>
        </section>
      )}
    </div>
  );
}
