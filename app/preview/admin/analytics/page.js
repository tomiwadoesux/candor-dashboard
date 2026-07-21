import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat, moneyList } from "@/components/admin/kit";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const s = preview.paymentSummary;
  const metrics = preview.adminMetrics;
  const pipeline = [
    { label: "Awaiting client", status: "awaiting_client_payment", count: s.awaiting.count },
    { label: "Client paid", status: "client_paid", count: s.clientPaid.count },
    { label: "Talent paid", status: "talent_paid", count: s.talentPaid.count },
  ];

  return (
    <AdminFrame>
      <PageIntro
        eyebrow="Business · Analytics"
        meta="MD & CEO only"
        title={<>The <span className="editorial-italic">numbers</span></>}
        lede="A candid look at the business — what's moving, who's earning, where the work is coming from."
      />
      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Revenue · YTD" value={moneyList(s.ytdRevenue, "—")} sub="Gross this year" accent="success" />
        <Stat label="Commission · YTD" value={moneyList(s.ytdCommission, "—")} sub="Agency share" accent="brand" />
        <Stat label="Active talent" value={metrics.activeTalentCount} sub={`${metrics.bookingsThisMonth} bookings this month`} />
        <Stat label="Pending payouts" value={moneyList(metrics.pendingPaymentsNet, "All clear")} sub="Net owed to talent" accent="warning" />
      </div>
      <AnalyticsCharts pipeline={pipeline} ytdRevenue={s.ytdRevenue} ytdCommission={s.ytdCommission} castingAnalytics={preview.castingAnalytics} />
    </AdminFrame>
  );
}
