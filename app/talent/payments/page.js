import {
  AwaitingCard,
  EarningsChart,
  PaymentStatement,
} from "@/components/talent/payments/statement";
import { bookings, invoices } from "@/lib/data";

const ME_ID = "1";

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

function fmtMoney(n) {
  return `₦ ${n.toLocaleString("en-GB")}`;
}

function splitForMe(invoice, booking) {
  const count = booking?.talentIds?.length || 1;
  if (count === 1) return invoice;
  const gross = Math.round(parseMoney(invoice.amount) / count);
  const commission = Math.round(parseMoney(invoice.commission) / count);
  const net = Math.round(parseMoney(invoice.talentPay) / count);
  return {
    ...invoice,
    amount: fmtMoney(gross),
    commission: fmtMoney(commission),
    talentPay: fmtMoney(net),
    shared: true,
    talentCount: count,
  };
}

const EXTRA_INVOICES = [
  {
    id: "INV-005",
    client: "Afropolitan",
    booking: "b-zara-3",
    amount: "NGN 550,000",
    commission: "NGN 110,000",
    talentPay: "NGN 440,000",
    status: "Draft",
    issuedDate: "",
    dueDate: "",
  },
  {
    id: "INV-006",
    client: "Maison Ire",
    booking: "b-zara-past",
    amount: "NGN 320,000",
    commission: "NGN 64,000",
    talentPay: "NGN 256,000",
    status: "Paid",
    issuedDate: "2026-01-22",
    dueDate: "2026-02-05",
  },
];

const BANK = {
  bank: "GTBank",
  account: "•••• 8241",
  name: "Ayotomiwa Durojaye",
  currency: "NGN",
};

export default function PaymentsPage() {
  const myBookingIds = bookings
    .filter((b) => b.talentIds?.includes(ME_ID))
    .map((b) => b.id);

  const mine = invoices
    .filter((inv) => myBookingIds.includes(inv.booking))
    .map((inv) => {
      const booking = bookings.find((b) => b.id === inv.booking);
      return splitForMe(inv, booking);
    });

  const all = [...mine, ...EXTRA_INVOICES];

  const grossYtd = all.reduce((sum, i) => sum + parseMoney(i.amount), 0);
  const netReceived = all
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + parseMoney(i.talentPay), 0);
  const awaiting = all
    .filter((i) => i.status === "Sent" || i.status === "Overdue")
    .reduce((sum, i) => sum + parseMoney(i.talentPay), 0);
  const commissionYtd = all.reduce(
    (sum, i) => sum + parseMoney(i.commission),
    0
  );

  const overdue = all.find((i) => i.status === "Overdue");

  const months = [
    { key: "jan", label: "Jan", net: 256000 },
    { key: "feb", label: "Feb", net: 360000 },
    {
      key: "mar",
      label: "Mar",
      net: all
        .filter((i) => i.issuedDate?.startsWith("2026-03"))
        .reduce((s, i) => s + parseMoney(i.talentPay), 0),
    },
    {
      key: "apr",
      label: "Apr",
      net: 480000,
    },
    { key: "may", label: "May", net: 0 },
    { key: "jun", label: "Jun", net: 0 },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Payments
        </div>
        <div className="text-[11px] text-muted-foreground">
          {all.length} invoices · NGN
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Payments</span>
      </h2>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
        Your statement. Gross fee, Candor&apos;s 20%, what has landed, what is
        pending. View only — your booker reconciles and chases late payers.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <HeroStat
          label="Gross YTD"
          value={fmtMoney(grossYtd)}
          sub={`Across ${all.length} invoices`}
        />
        <HeroStat
          label="Net received"
          value={fmtMoney(netReceived)}
          sub="Landed in your account"
        />
        <HeroStat
          label="Awaiting"
          value={fmtMoney(awaiting)}
          sub={overdue ? `${overdue.client} overdue` : "All on schedule"}
          tone={overdue ? "warn" : null}
        />
        <HeroStat
          label="Commission"
          value={fmtMoney(commissionYtd)}
          sub="20% · paid to Candor"
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <EarningsChart months={months} />
        </div>
        <div className="md:col-span-4 space-y-4">
          {overdue && (
            <AwaitingCard
              amount={parseMoney(overdue.talentPay)}
              invoiceId={overdue.id}
              client={overdue.client}
            />
          )}
          <div className="rounded-sm border border-border/60 bg-muted/30 p-5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Candor note
            </div>
            <p className="mt-1.5 font-serif text-[13.5px] font-light italic leading-relaxed text-foreground">
              &ldquo;Ziva still needs a nudge — we sent a second reminder on the
              14th. Expect settlement by end of the month.&rdquo;
            </p>
            <div className="mt-2 font-mono text-[9.5px] text-muted-foreground/60">
              Tomi · booker
            </div>
          </div>
        </div>
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
        <div className="mt-6">
          <PaymentStatement invoices={all} bank={BANK} />
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, sub, tone }) {
  const accent =
    tone === "warn"
      ? "text-rose-700 dark:text-rose-400"
      : "text-muted-foreground";
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-2 font-serif text-[30px] font-light tracking-[-0.02em] text-foreground">
        {value}
      </div>
      {sub && <div className={`mt-1 text-[11px] ${accent}`}>{sub}</div>}
    </div>
  );
}
