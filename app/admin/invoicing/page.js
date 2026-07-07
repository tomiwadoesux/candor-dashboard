import { requireRole, FINANCE_ROLES } from "@/lib/auth";
import { listPayments, paymentSummary } from "@/lib/queries/payments";
import { PageIntro, Stat, moneyList } from "@/components/admin/kit";
import { InvoiceRegister } from "@/components/admin/invoice-register";

export default async function InvoicingAdminPage({ searchParams }) {
  const profile = await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";

  const [summary, payments] = await Promise.all([
    paymentSummary(),
    listPayments({ status: status || undefined }),
  ]);

  const canManage = FINANCE_ROLES.includes(profile.role);

  const grossOf = (totals) => moneyList(
    Object.fromEntries(
      Object.entries(totals || {}).map(([cur, t]) => [cur, t.gross])
    ),
    "—"
  );

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Ledger"
        meta={`${payments.length} payment${payments.length === 1 ? "" : "s"} in view`}
        title={
          <>
            Invoicing <span className="editorial-italic">&amp; payouts</span>
          </>
        }
        lede={
          canManage
            ? "Gross billed, commission earned, talent payable — kept open so the money is always in view."
            : "Read-only ledger view. Marking payments and setting invoice numbers is reserved for MD and CEO."
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-5">
        <Stat
          label="Awaiting client"
          value={summary.awaiting.count}
          sub={grossOf(summary.awaiting.totals)}
          accent={summary.awaiting.count > 0 ? "warning" : null}
        />
        <Stat
          label="Client paid"
          value={summary.clientPaid.count}
          sub={grossOf(summary.clientPaid.totals)}
          accent="bronze"
        />
        <Stat
          label="Talent paid"
          value={summary.talentPaid.count}
          sub={grossOf(summary.talentPaid.totals)}
          accent="success"
        />
        <Stat
          label="Revenue · YTD"
          value={moneyList(summary.ytdRevenue, "—")}
          sub="Gross this calendar year"
        />
        <Stat
          label="Commission · YTD"
          value={moneyList(summary.ytdCommission, "—")}
          sub="Agency share"
          accent="bronze"
        />
      </div>

      <div className="mt-10">
        <InvoiceRegister payments={payments} status={status} canManage={canManage} />
      </div>
    </div>
  );
}
