import { InvoiceRegister } from "@/components/admin/invoice-register";
import { invoices } from "@/lib/data";

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

function fmtNgn(n) {
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦ ${(n / 1_000).toFixed(0)}K`;
  return `₦ ${n}`;
}

export default function InvoicingAdminPage() {
  const totalGross = invoices.reduce((s, i) => s + parseMoney(i.amount), 0);
  const collected = invoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + parseMoney(i.amount), 0);
  const outstanding = invoices
    .filter((i) => i.status === "Sent" || i.status === "Overdue")
    .reduce((s, i) => s + parseMoney(i.amount), 0);
  const overdueAmount = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((s, i) => s + parseMoney(i.amount), 0);
  const commission = invoices.reduce(
    (s, i) => s + parseMoney(i.commission),
    0
  );
  const commissionCollected = invoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + parseMoney(i.commission), 0);
  const talentPayable = invoices.reduce(
    (s, i) => s + parseMoney(i.talentPay),
    0
  );
  const talentPaid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + parseMoney(i.talentPay), 0);

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Ledger
        </div>
        <div className="text-[11px] text-muted-foreground">
          {invoices.length} invoices on the book
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        Invoicing <span className="editorial-italic">&amp; payouts</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Gross billed, commission earned, talent payable — kept open so the
        money is always in view. Overdue invoices rise to the top.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="Gross" value={fmtNgn(totalGross)} sub="Invoiced year-to-date" />
        <Stat
          label="Collected"
          value={fmtNgn(collected)}
          sub="Paid in full"
          accent="emerald"
        />
        <Stat
          label="Outstanding"
          value={fmtNgn(outstanding)}
          sub="Sent, not yet paid"
          accent={outstanding > 0 ? "amber" : null}
        />
        <Stat
          label="Overdue"
          value={fmtNgn(overdueAmount)}
          sub={overdueAmount > 0 ? "Chase today" : "All clear"}
          accent={overdueAmount > 0 ? "rose" : null}
        />
      </div>

      <div className="mt-10">
        <InvoiceRegister invoices={invoices} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 border-t border-border/60 pt-10 md:grid-cols-2">
        <Ledger
          title="Agency ledger"
          subtitle="20% commission across the board"
          rows={[
            { label: "Commission booked", value: fmtNgn(commission) },
            {
              label: "Commission banked",
              value: fmtNgn(commissionCollected),
              tone: "emerald",
            },
            {
              label: "Still to land",
              value: fmtNgn(commission - commissionCollected),
              tone: (commission - commissionCollected) > 0 ? "amber" : null,
            },
          ]}
        />
        <Ledger
          title="Talent payable"
          subtitle="Paid out against gross collected"
          rows={[
            { label: "Total talent pay", value: fmtNgn(talentPayable) },
            {
              label: "Paid out",
              value: fmtNgn(talentPaid),
              tone: "emerald",
            },
            {
              label: "Queued for payout",
              value: fmtNgn(talentPayable - talentPaid),
              tone: (talentPayable - talentPaid) > 0 ? "amber" : null,
            },
          ]}
        />
      </div>
    </div>
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

function Ledger({ title, subtitle, rows }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
        {subtitle}
      </div>
      <h3 className="mt-1 font-serif text-[22px] font-light text-foreground">
        {title}
      </h3>
      <ul className="mt-5 divide-y divide-border/60 border-y border-border/60">
        {rows.map((r, i) => {
          const tone =
            r.tone === "emerald"
              ? "text-emerald-700 dark:text-emerald-400"
              : r.tone === "amber"
              ? "text-amber-700 dark:text-amber-400"
              : r.tone === "rose"
              ? "text-rose-700 dark:text-rose-400"
              : "text-foreground";
          return (
            <li
              key={i}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <span className="text-[12px] text-muted-foreground">
                {r.label}
              </span>
              <span className={`font-serif text-[20px] font-light ${tone}`}>
                {r.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
