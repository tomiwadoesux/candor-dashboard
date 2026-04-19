"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, Building2, Check, Clock, X } from "lucide-react";
import { LineChart } from "@/components/charts/line-chart";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Paid", label: "Paid" },
  { id: "Sent", label: "Sent" },
  { id: "Overdue", label: "Overdue" },
  { id: "Draft", label: "Draft" },
];

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

function fmtMoney(n) {
  if (!n) return "—";
  return `₦ ${n.toLocaleString("en-GB")}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status) {
  switch (status) {
    case "Paid":
      return { bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" };
    case "Sent":
      return { bg: "bg-sky-500", text: "text-sky-700 dark:text-sky-400" };
    case "Overdue":
      return { bg: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" };
    case "Draft":
      return { bg: "bg-muted-foreground", text: "text-muted-foreground" };
    default:
      return { bg: "bg-muted-foreground", text: "text-muted-foreground" };
  }
}

function StatusDot({ status }) {
  const tone = statusTone(status).bg;
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      {status === "Overdue" && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${tone} opacity-75`} />
      )}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tone}`} />
    </span>
  );
}

export function PaymentStatement({ invoices, bank }) {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const sorted = useMemo(
    () =>
      [...invoices].sort((a, b) => {
        const da = new Date(a.issuedDate || "2000-01-01");
        const db = new Date(b.issuedDate || "2000-01-01");
        return db - da;
      }),
    [invoices]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((i) => i.status === filter);
  }, [sorted, filter]);

  const counts = useMemo(() => {
    const c = { all: sorted.length };
    sorted.forEach((i) => {
      c[i.status] = (c[i.status] || 0) + 1;
    });
    return c;
  }, [sorted]);

  const open = filtered.find((i) => i.id === openId) || null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
              <span
                className={`font-mono text-[9.5px] ${
                  active ? "text-background/70" : "text-muted-foreground/60"
                }`}
              >
                {counts[f.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 border-y border-border/60 py-10 text-center text-[13px] text-muted-foreground">
          Nothing here yet.
        </div>
      )}

      <div className="mt-6">
        <div className="hidden grid-cols-12 gap-4 border-b border-border/60 pb-2 text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/70 md:grid">
          <div className="col-span-1">Invoice</div>
          <div className="col-span-4">Client · Job</div>
          <div className="col-span-2 text-right">Gross</div>
          <div className="col-span-2 text-right">Commission</div>
          <div className="col-span-2 text-right">Net to you</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        <ul className="divide-y divide-border/60">
          {filtered.map((inv) => {
            const tone = statusTone(inv.status);
            return (
              <li key={inv.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(inv.id)}
                  className="group grid w-full grid-cols-2 gap-x-4 gap-y-2 py-4 text-left transition-colors hover:bg-muted/30 md:grid-cols-12 md:py-5"
                >
                  <div className="col-span-1 font-mono text-[11px] text-muted-foreground">
                    {inv.id}
                  </div>
                  <div className="col-span-1 min-w-0 md:col-span-4">
                    <div className="truncate font-serif text-[17px] font-light text-foreground">
                      {inv.client}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Issued {fmtDate(inv.issuedDate)}{" "}
                      {inv.dueDate && (
                        <>
                          <span className="text-muted-foreground/40">·</span> Due{" "}
                          {fmtDate(inv.dueDate)}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 text-right md:col-span-2">
                    <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70 md:hidden">
                      Gross
                    </div>
                    <div className="font-mono text-[12.5px] text-foreground">
                      {fmtMoney(parseMoney(inv.amount))}
                    </div>
                  </div>
                  <div className="col-span-1 text-right md:col-span-2">
                    <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70 md:hidden">
                      Commission
                    </div>
                    <div className="font-mono text-[12.5px] text-muted-foreground">
                      −{fmtMoney(parseMoney(inv.commission))}
                    </div>
                  </div>
                  <div className="col-span-1 text-right md:col-span-2">
                    <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70 md:hidden">
                      Net
                    </div>
                    <div className="font-serif text-[17px] font-light text-foreground">
                      {fmtMoney(parseMoney(inv.talentPay))}
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end md:col-span-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${tone.text}`}
                    >
                      <StatusDot status={inv.status} />
                      {inv.status}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {bank && (
        <div className="mt-10 rounded-sm border border-border/60 bg-muted/30 p-5">
          <div className="flex items-baseline gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Payout account
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
            <Field label="Bank">{bank.bank}</Field>
            <Field label="Account">
              <span className="font-mono text-[13px]">{bank.account}</span>
            </Field>
            <Field label="Name">{bank.name}</Field>
            <Field label="Currency">{bank.currency}</Field>
          </div>
          <p className="mt-4 text-[10.5px] text-muted-foreground">
            To change payout details, message Tomi in Communications.
          </p>
        </div>
      )}

      {open && <InvoiceDetail invoice={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-[13px] text-foreground">{children}</div>
    </div>
  );
}

function InvoiceDetail({ invoice: inv, onClose }) {
  const gross = parseMoney(inv.amount);
  const commission = parseMoney(inv.commission);
  const net = parseMoney(inv.talentPay);
  const commissionRate = gross ? Math.round((commission / gross) * 100) : 20;
  const tone = statusTone(inv.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-border/60 p-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              {inv.id}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${tone.text}`}
            >
              <StatusDot status={inv.status} />
              {inv.status}
            </span>
          </div>
          <h3 className="mt-2 font-serif text-[30px] font-light leading-tight text-foreground">
            <span className="editorial-italic">{inv.client}</span>
          </h3>
          <div className="mt-1.5 text-[12px] text-muted-foreground">
            Issued {fmtDate(inv.issuedDate)}
            {inv.dueDate && ` · Due ${fmtDate(inv.dueDate)}`}
          </div>
        </div>

        <div className="divide-y divide-border/60 p-6">
          <Row label="Gross fee" mono value={fmtMoney(gross)} />
          <Row
            label={`Candor commission · ${commissionRate}%`}
            mono
            value={`− ${fmtMoney(commission)}`}
            muted
          />
          <div className="flex items-baseline justify-between py-4">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Net to you
            </span>
            <span className="font-serif text-[26px] font-light text-foreground">
              {fmtMoney(net)}
            </span>
          </div>
        </div>

        {inv.status === "Overdue" && (
          <div className="border-t border-border/60 bg-rose-500/5 p-4">
            <div className="flex items-baseline gap-2">
              <Clock className="h-3 w-3 text-rose-600 dark:text-rose-400" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-rose-700 dark:text-rose-400">
                Overdue · Candor is chasing
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              We&apos;re actively following up. No action needed from you.
            </p>
          </div>
        )}

        {inv.status === "Paid" && (
          <div className="border-t border-border/60 bg-emerald-500/5 p-4">
            <div className="flex items-baseline gap-2">
              <Check className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                Paid · Landed in your account
              </span>
            </div>
          </div>
        )}

        <div className="border-t border-border/60 p-4 text-center text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Reconciled by your booker · view only
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted, mono }) {
  return (
    <div className="flex items-baseline justify-between py-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span
        className={`${mono ? "font-mono text-[13px]" : "text-[13px]"} ${
          muted ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function EarningsChart({ months }) {
  const data = months.map((m) => ({ label: m.label, values: [m.net] }));
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
        <h3 className="font-serif text-[20px] font-light text-foreground">
          <span className="editorial-italic">Monthly net</span>
        </h3>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          After 20% commission
        </span>
      </div>
      <div className="mt-4">
        <LineChart
          height={200}
          data={data}
          series={[
            {
              key: "net",
              label: "Net",
              color: "oklch(55% 0.2 25)",
              fill: true,
            },
          ]}
          formatValue={(n) =>
            n >= 1_000_000
              ? `₦${(n / 1_000_000).toFixed(1)}M`
              : n >= 1_000
                ? `₦${Math.round(n / 1_000)}K`
                : `₦${n}`
          }
        />
      </div>
    </div>
  );
}

export function AwaitingCard({ amount, invoiceId, client }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Awaiting
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-rose-700 dark:text-rose-400">
          <ArrowDownRight className="h-3 w-3" />
          Chasing
        </span>
      </div>
      <div className="mt-2 font-serif text-[30px] font-light leading-none text-foreground">
        {fmtMoney(amount)}
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">
        {invoiceId} · {client}
      </p>
    </div>
  );
}
