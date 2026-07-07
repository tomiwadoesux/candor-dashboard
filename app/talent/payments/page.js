import { myPayments, talentPaymentSummary } from "@/lib/queries/payments";
import { dateShort, money, statusLabel } from "@/lib/format";
import { moneyTotals } from "@/components/talent/money-totals";
import { paymentTone } from "@/components/talent/status-tones";

export default async function PaymentsPage() {
  const [summary, payments] = await Promise.all([
    talentPaymentSummary(),
    myPayments(),
  ]);

  const { earnedYtdGross, paidYtdNet, pendingNet, nextExpected } = summary;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Payments
        </div>
        <div className="text-[11px] text-muted-foreground">
          {payments.length} on record
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Payments</span>
      </h2>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
        Your statement. Gross fee, Candor&apos;s commission, what has landed and
        what is pending. View only — your booker reconciles and chases late
        payers.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <HeroStat
          label="Earned YTD"
          value={moneyTotals(earnedYtdGross)}
          sub="Gross, before commission"
        />
        <HeroStat
          label="Net received"
          value={moneyTotals(paidYtdNet)}
          sub="Landed this year"
        />
        <HeroStat
          label="Pending"
          value={moneyTotals(pendingNet)}
          sub="Awaiting payout"
          tone={Object.keys(pendingNet ?? {}).length ? "warn" : null}
        />
        <HeroStat
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
      </div>

      <div className="mt-14">
        <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
          <h3 className="font-serif text-[22px] font-light text-foreground">
            <span className="editorial-italic">Statement</span>
          </h3>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Most recent first
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="border-b border-border/60 py-12 text-center">
            <p className="font-serif text-[18px] italic text-muted-foreground">
              No payments yet.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              Your first statement appears once a booking is invoiced.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="hidden grid-cols-12 gap-4 border-b border-border/60 pb-2 text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/70 md:grid">
              <div className="col-span-4">Project</div>
              <div className="col-span-2 text-right">Gross</div>
              <div className="col-span-2 text-right">Commission</div>
              <div className="col-span-2 text-right">Net to you</div>
              <div className="col-span-1 text-right">Invoice</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            <ul className="divide-y divide-border/60">
              {payments.map((p) => {
                const tone = paymentTone(p.status);
                return (
                  <li
                    key={p.id}
                    className="grid grid-cols-2 gap-x-4 gap-y-2 py-4 md:grid-cols-12 md:py-5"
                  >
                    <div className="col-span-2 min-w-0 md:col-span-4">
                      <div className="truncate font-serif text-[17px] font-light text-foreground">
                        {p.booking?.project_title ?? "Booking"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {dateShort(p.booking?.booking_date ?? p.created_at)}
                        {p.talent_payment_date && (
                          <>
                            {" "}
                            <span className="text-muted-foreground/40">·</span> Paid{" "}
                            {dateShort(p.talent_payment_date)}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 text-right md:col-span-2">
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70 md:hidden">
                        Gross
                      </div>
                      <div
                        data-slot="numeric"
                        className="text-[12.5px] text-foreground"
                      >
                        {money(p.gross_fee, p.currency)}
                      </div>
                    </div>
                    <div className="col-span-1 text-right md:col-span-2">
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70 md:hidden">
                        Commission · {Number(p.commission_rate)}%
                      </div>
                      <div
                        data-slot="numeric"
                        className="text-[12.5px] text-muted-foreground"
                      >
                        −{money(p.commission_amount, p.currency)}
                      </div>
                      <div className="hidden text-[9.5px] text-muted-foreground/60 md:block">
                        {Number(p.commission_rate)}%
                      </div>
                    </div>
                    <div className="col-span-1 text-right md:col-span-2">
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70 md:hidden">
                        Net
                      </div>
                      <div
                        data-slot="numeric"
                        className="font-serif text-[17px] font-light text-foreground"
                      >
                        {money(p.net_talent_payment, p.currency)}
                      </div>
                    </div>
                    <div className="col-span-1 flex items-start justify-end md:col-span-1">
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        {p.invoice_number ?? "—"}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-start justify-end md:col-span-1">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${tone.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                        {statusLabel(p.status)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-14 rounded-sm border border-border/60 bg-muted/30 p-5">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          How it works
        </div>
        <p className="mt-1.5 font-serif text-[13.5px] font-light italic leading-relaxed text-foreground">
          Candor invoices the client, deducts the agreed commission, and pays the
          net to your account. To change payout details, email bookings@.
        </p>
      </div>
    </div>
  );
}

function HeroStat({ label, value, sub, tone }) {
  const accent = tone === "warn" ? "text-warning" : "text-muted-foreground";
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div
        data-slot="numeric"
        className="mt-2 font-serif text-[26px] font-light tracking-[-0.02em] text-foreground"
      >
        {value}
      </div>
      {sub && <div className={`mt-1 truncate text-[11px] ${accent}`}>{sub}</div>}
    </div>
  );
}
