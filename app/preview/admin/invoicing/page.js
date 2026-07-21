import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat, moneyList } from "@/components/admin/kit";
import { InvoiceRegister } from "@/components/admin/invoice-register";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const payments = preview.payments;
  const s = preview.paymentSummary;
  const awaiting = payments.filter((p) => p.status === "awaiting_client_payment").length;

  return (
    <AdminFrame>
      <PageIntro title="Invoicing & payouts" meta={`${payments.length} in the register`} lede="Client invoicing and talent payouts. Processing is gated to MD & CEO." />
      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Revenue · YTD" value={moneyList(s.ytdRevenue, "—")} accent="success" />
        <Stat label="Commission · YTD" value={moneyList(s.ytdCommission, "—")} accent="brand" />
        <Stat label="Awaiting client" value={awaiting} accent="warning" />
        <Stat label="In register" value={payments.length} />
      </div>
      <div className="mt-8">
        <InvoiceRegister payments={payments} canManage />
      </div>
    </AdminFrame>
  );
}
