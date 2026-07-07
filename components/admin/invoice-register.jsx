"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Hash } from "lucide-react";
import {
  markClientPaid,
  markTalentPaid,
  setInvoiceNumber,
} from "@/lib/actions/payments";
import { dateShort, money } from "@/lib/format";
import { StatusPill, paymentAccent, EmptyRow } from "@/components/admin/kit";

const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "awaiting_client_payment", label: "Awaiting client" },
  { id: "client_paid", label: "Client paid" },
  { id: "talent_paid", label: "Talent paid" },
];

export function InvoiceRegister({ payments, status = "", canManage = false }) {
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [invoiceEditId, setInvoiceEditId] = useState(null);
  const [invoiceDraft, setInvoiceDraft] = useState("");
  const [, startTransition] = useTransition();

  function run(id, fn) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      setBusyId(null);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.id;
          return (
            <Link
              key={f.id || "all"}
              href={f.id ? `/admin/invoicing?status=${f.id}` : "/admin/invoicing"}
              className={`pressable inline-flex items-center rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          {error}
        </div>
      )}

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {payments.map((p) => (
          <li key={p.id} className="py-5">
            <div className="grid grid-cols-12 items-start gap-x-4">
              <div className="col-span-2">
                {invoiceEditId === p.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(p.id, async () => {
                        const result = await setInvoiceNumber(p.id, invoiceDraft);
                        if (!result?.error) setInvoiceEditId(null);
                        return result;
                      });
                    }}
                    className="flex items-center gap-1"
                  >
                    <input
                      autoFocus
                      value={invoiceDraft}
                      onChange={(e) => setInvoiceDraft(e.target.value)}
                      placeholder="CAN-2026-001"
                      className="w-28 rounded-sm border border-dashed border-border bg-card/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground focus:border-foreground focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={busyId === p.id}
                      className="pressable text-muted-foreground hover:text-success disabled:opacity-50"
                      aria-label="Save invoice number"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-muted-foreground/80">
                      {p.invoice_number || "No invoice №"}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setInvoiceEditId(p.id);
                          setInvoiceDraft(p.invoice_number || "");
                        }}
                        className="pressable text-muted-foreground/60 transition-colors hover:text-foreground"
                        aria-label="Edit invoice number"
                        title="Set invoice number"
                      >
                        <Hash className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
                <div className="mt-1.5 font-mono text-[10px] text-muted-foreground/70">
                  Raised {dateShort(p.created_at)}
                </div>
              </div>

              <div className="col-span-4 min-w-0">
                <Link
                  href={p.booking ? `/admin/bookings/${p.booking.id}` : "/admin/bookings"}
                  className="group inline-flex max-w-full items-baseline gap-1.5"
                >
                  <span className="truncate font-serif text-[17px] font-light text-foreground group-hover:underline">
                    {p.booking?.project_title || "Booking"}
                  </span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                </Link>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {p.talent ? `${p.talent.first_name} ${p.talent.last_name}` : "—"}
                  {p.booking?.client ? ` · ${p.booking.client.company_name}` : ""}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                  Job date {dateShort(p.booking?.booking_date)}
                </div>
              </div>

              <div className="col-span-2 text-right">
                <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                  Gross
                </div>
                <div
                  data-slot="numeric"
                  className="mt-0.5 font-serif text-[17px] font-light text-foreground"
                >
                  {money(p.gross_fee, p.currency)}
                </div>
                <div data-slot="numeric" className="mt-0.5 font-mono text-[10.5px] text-bronze">
                  comm {money(p.commission_amount, p.currency)}
                </div>
                <div
                  data-slot="numeric"
                  className="font-mono text-[10.5px] text-muted-foreground"
                >
                  net {money(p.net_talent_payment, p.currency)}
                </div>
              </div>

              <div className="col-span-2 text-right">
                <StatusPill status={p.status} accent={paymentAccent(p.status)} />
                <div className="mt-1 space-y-0.5 font-mono text-[10px] text-muted-foreground/70">
                  {p.client_payment_date && (
                    <div>Client {dateShort(p.client_payment_date)}</div>
                  )}
                  {p.talent_payment_date && (
                    <div>Talent {dateShort(p.talent_payment_date)}</div>
                  )}
                </div>
              </div>

              <div className="col-span-2 flex flex-col items-end gap-1.5">
                {canManage && p.status === "awaiting_client_payment" && (
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => run(p.id, () => markClientPaid(p.id))}
                    className="pressable inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-bronze hover:text-bronze disabled:opacity-60"
                  >
                    {busyId === p.id ? "Working…" : "Mark client paid"}
                  </button>
                )}
                {canManage && p.status === "client_paid" && (
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => run(p.id, () => markTalentPaid(p.id))}
                    className="pressable inline-flex h-7 items-center gap-1 rounded-full bg-foreground px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-background disabled:opacity-60"
                  >
                    {busyId === p.id ? "Working…" : "Mark talent paid"}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
        {payments.length === 0 && (
          <EmptyRow>
            No payments in this view — payments are raised from a booking&apos;s detail page.
          </EmptyRow>
        )}
      </ul>
    </>
  );
}
