import { myPayments, talentPaymentSummary } from "@/lib/queries/payments";
import { getMyTalentProfile } from "@/lib/queries/talent";
import { dateShort, money, statusLabel } from "@/lib/format";
import { moneyTotals } from "@/components/talent/money-totals";
import { paymentTone } from "@/components/talent/status-tones";
import {
  PageHeader,
  SectionHead,
  StatRow,
  StatTile,
  ToneChip,
} from "@/components/talent/kit";
import { PrintButton } from "@/components/talent/print-button";

export default async function PaymentsPage() {
  const [summary, payments, me] = await Promise.all([
    talentPaymentSummary(),
    myPayments(),
    getMyTalentProfile(),
  ]);

  const { earnedYtdGross, paidYtdNet, pendingNet, nextExpected } = summary;
  const year = new Date().getFullYear();

  return (
    <div>
      <PageHeader
        title="Payments"
        meta={`${payments.length} on record`}
        action={payments.length > 0 ? <PrintButton /> : null}
      />

      {/* Statement header — print only */}
      <div className="print-only mb-6 border-b border-border pb-4">
        <div className="text-[16px] font-semibold">Candor Management Agency</div>
        <div className="mt-1 text-[12px]">
          Earnings statement — {me ? `${me.first_name} ${me.last_name}` : ""} ·
          generated {dateShort(new Date())}
        </div>
      </div>

      <StatRow className="no-print">
        <StatTile
          label="Earned this year"
          value={moneyTotals(earnedYtdGross)}
          sub="Gross, before commission"
        />
        <StatTile label="Net received" value={moneyTotals(paidYtdNet)} />
        <StatTile
          label="Pending"
          value={moneyTotals(pendingNet)}
          tone={Object.keys(pendingNet ?? {}).length ? "warn" : null}
        />
        <StatTile
          label="Next expected"
          value={
            nextExpected
              ? money(nextExpected.net_talent_payment, nextExpected.currency)
              : "—"
          }
          sub={
            nextExpected
              ? nextExpected.booking?.project_title ?? statusLabel(nextExpected.status)
              : "Nothing in flight"
          }
        />
      </StatRow>

      <div className="mt-8">
        <SectionHead
          title={`Statement · ${year}`}
          meta="Most recent first"
          className="border-b border-border pb-2.5"
        />

        {payments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[14px] font-medium text-foreground">No payments yet</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Your first statement line appears once a booking is invoiced.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/60 text-[11.5px] font-medium text-muted-foreground">
                  <th className="py-2.5 pr-4 font-medium">Project</th>
                  <th className="py-2.5 pr-4 text-right font-medium">Gross</th>
                  <th className="py-2.5 pr-4 text-right font-medium">Commission</th>
                  <th className="py-2.5 pr-4 text-right font-medium">Net to you</th>
                  <th className="py-2.5 pr-4 text-right font-medium">Invoice</th>
                  <th className="py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((p) => {
                  const tone = paymentTone(p.status);
                  return (
                    <tr key={p.id} className="align-top">
                      <td className="max-w-[260px] py-3.5 pr-4">
                        <div className="truncate text-[13px] font-medium text-foreground">
                          {p.booking?.project_title ?? "Booking"}
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {dateShort(p.booking?.booking_date ?? p.created_at)}
                          {p.talent_payment_date &&
                            ` · paid ${dateShort(p.talent_payment_date)}`}
                        </div>
                      </td>
                      <td
                        data-slot="numeric"
                        className="py-3.5 pr-4 text-right text-[12.5px] text-foreground"
                      >
                        {money(p.gross_fee, p.currency)}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div data-slot="numeric" className="text-[12.5px] text-muted-foreground">
                          −{money(p.commission_amount, p.currency)}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground/60">
                          {Number(p.commission_rate)}%
                        </div>
                      </td>
                      <td
                        data-slot="numeric"
                        className="py-3.5 pr-4 text-right text-[13px] font-medium text-foreground"
                      >
                        {money(p.net_talent_payment, p.currency)}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {p.invoice_number ?? "—"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <ToneChip status={p.status} tone={tone} className="text-[11.5px]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="no-print mt-10 max-w-[64ch] text-[12px] leading-relaxed text-muted-foreground">
        Candor invoices the client, deducts the agreed commission, and pays the
        net to your account. To change payout details, email
        bookings@candormanagement.com.
      </p>
    </div>
  );
}
