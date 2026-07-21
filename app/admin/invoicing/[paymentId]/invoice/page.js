import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getPaymentById } from "@/lib/queries/payments";
import { dateShort, money, statusLabel } from "@/lib/format";
import { dueInfo } from "@/lib/tools/chase";
import { InvoiceToolbar } from "./toolbar";

/*
  Print isolation. The admin layout renders:
    <div> <aside …sidebar> … <div> <header …topbar> <main>{page}</main> </div> </div>
  so `aside, header { display:none }` removes all app chrome (this page renders
  no aside/header of its own). The sheet itself re-declares the light-theme
  token values under .invoice-sheet, so it stays a fixed white/bone card in
  dark mode on screen AND prints with ink-on-white regardless of theme.
*/
const SHEET_CSS = `
.invoice-sheet {
  --background: oklch(0.968 0.007 84);
  --foreground: oklch(0.235 0.012 65);
  --card: oklch(0.988 0.004 88);
  --card-foreground: oklch(0.235 0.012 65);
  --muted: oklch(0.943 0.008 84);
  --muted-foreground: oklch(0.49 0.015 70);
  --border: oklch(0.9 0.01 80);
  --border-strong: oklch(0.848 0.012 80);
  --brand: oklch(0.55 0.115 60);
  --success: oklch(0.55 0.12 150);
  --warning: oklch(0.7 0.13 80);
  --destructive: oklch(0.5 0.17 25);
}
@page { size: A4; margin: 14mm; }
@media print {
  aside, header { display: none !important; }
  main { padding: 0 !important; animation: none !important; }
  html, body { background: #fff !important; }
  .invoice-sheet {
    width: 100% !important;
    max-width: none !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    box-shadow: none !important;
  }
}
`;

function SheetLabel({ children }) {
  return (
    <div className="text-[11.5px] font-medium text-muted-foreground/80">
      {children}
    </div>
  );
}

function Masthead({ docLabel, number, issued }) {
  return (
    <div className="flex items-start justify-between border-b border-border pb-7">
      <div>
        <div className="text-[22px] font-semibold tracking-[-0.02em] leading-none tracking-[0.3em] text-foreground">
          CANDOR
        </div>
        <div className="mt-2 text-[11.5px] font-medium text-muted-foreground">
          Talent Management · Lagos · London · USA
        </div>
      </div>
      <div className="text-right">
        <SheetLabel>{docLabel}</SheetLabel>
        <div data-slot="numeric" className="mt-1.5 font-mono text-[13px] text-foreground">
          {number}
        </div>
        <div className="mt-1 text-[10.5px] text-muted-foreground">Issued {issued}</div>
      </div>
    </div>
  );
}

function SheetFooter() {
  return (
    <div className="mt-auto border-t border-border pt-5 text-center">
      <div className="editorial-italic text-[13px] text-muted-foreground">
        With thanks, from all of us at Candor
      </div>
      <div className="mt-1.5 text-[11.5px] font-medium text-muted-foreground/80">
        Candor Management Agency · contact@candor-management.com
      </div>
    </div>
  );
}

function BankPlaceholder() {
  return (
    <div className="mt-8 rounded-sm border border-dashed border-border-strong px-5 py-4">
      <SheetLabel>Remit to</SheetLabel>
      <div className="mt-1.5 text-[12px] text-muted-foreground">
        Account details — configure in Settings.
      </div>
    </div>
  );
}

function ClientInvoiceBody({ payment: p }) {
  const client = p.booking?.client;
  const terms = client?.payment_terms || "Net 14";
  const { dueDate } = dueInfo(p.created_at, terms);

  return (
    <>
      <div className="mt-9 grid grid-cols-2 gap-x-10">
        <div>
          <SheetLabel>Billed to</SheetLabel>
          <div className="mt-2 text-[13.5px] font-medium text-foreground">
            {client?.company_name || "Client"}
          </div>
          <div className="mt-1 space-y-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
            {client?.contact_person && <div>Attn. {client.contact_person}</div>}
            {client?.address && <div className="whitespace-pre-line">{client.address}</div>}
            {client?.email && <div>{client.email}</div>}
          </div>
        </div>
        <div className="text-right">
          <SheetLabel>Payment terms</SheetLabel>
          <div className="mt-2 text-[12.5px] text-foreground">{terms}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Payment due {dateShort(dueDate)}
          </div>
          {client?.client_type && (
            <div className="mt-3 text-[11.5px] font-medium text-muted-foreground/80">
              {statusLabel(client.client_type)} client
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="grid grid-cols-12 gap-x-4 border-b border-border pb-2">
          <div className="col-span-9">
            <SheetLabel>Description</SheetLabel>
          </div>
          <div className="col-span-3 text-right">
            <SheetLabel>Amount</SheetLabel>
          </div>
        </div>
        <div className="grid grid-cols-12 items-baseline gap-x-4 border-b border-border py-5">
          <div className="col-span-9">
            <div className="text-[13.5px] font-medium text-foreground">
              {p.booking?.project_title || "Talent booking"}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {[p.booking?.service_type, dateShort(p.booking?.booking_date)]
                .filter(Boolean)
                .join(" · ")}
            </div>
            {(p.booking?.media_usage || p.booking?.territory || p.booking?.usage_term) && (
              <div className="mt-0.5 text-[10.5px] text-muted-foreground/80">
                {[p.booking?.media_usage, p.booking?.territory, p.booking?.usage_term]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
          <div
            data-slot="numeric"
            className="col-span-3 text-right font-mono text-[13px] text-foreground"
          >
            {money(p.gross_fee, p.currency)}
          </div>
        </div>
        <div className="grid grid-cols-12 items-baseline gap-x-4 py-4">
          <div className="col-span-9 text-right text-[11.5px] font-medium text-muted-foreground">
            Total due
          </div>
          <div
            data-slot="numeric"
            className="col-span-3 text-right text-[15px] font-semibold text-foreground"
          >
            {money(p.gross_fee, p.currency)}
          </div>
        </div>
      </div>

      <p className="mt-2 max-w-[64ch] text-[11px] leading-relaxed text-muted-foreground">
        Payment is due on {terms.toLowerCase().includes("upfront") ? "receipt of this invoice" : `these terms — ${terms}`}.
        Please quote the invoice number with your remittance.
      </p>

      <BankPlaceholder />
    </>
  );
}

function RemittanceRow({ label, sub, value, strong }) {
  return (
    <div className="grid grid-cols-12 items-baseline gap-x-4 border-b border-border py-4">
      <div className="col-span-8">
        <div
          className={
            strong
              ? "text-[12px] font-medium text-foreground"
              : "text-[12.5px] text-foreground"
          }
        >
          {label}
        </div>
        {sub && <div className="mt-0.5 text-[10.5px] text-muted-foreground">{sub}</div>}
      </div>
      <div
        data-slot="numeric"
        className={`col-span-4 text-right ${
          strong
            ? "text-[15px] font-semibold text-foreground"
            : "font-mono text-[13px] text-muted-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function RemittanceBody({ payment: p }) {
  const rate = Number(p.commission_rate);
  const statusLine =
    p.status === "talent_paid"
      ? `Paid to talent ${dateShort(p.talent_payment_date)}`
      : p.status === "client_paid"
        ? `Client settled ${dateShort(p.client_payment_date)} — talent payout in progress`
        : "Awaiting client payment — payout follows client settlement";

  return (
    <>
      <div className="mt-9 grid grid-cols-2 gap-x-10">
        <div>
          <SheetLabel>Prepared for</SheetLabel>
          <div className="mt-2 text-[13.5px] font-medium text-foreground">
            {p.talent ? `${p.talent.first_name} ${p.talent.last_name}` : "Talent"}
          </div>
          <div className="mt-1 text-[11.5px] text-muted-foreground">
            {p.booking?.project_title || "Booking"}
            {p.booking?.booking_date ? ` · ${dateShort(p.booking.booking_date)}` : ""}
          </div>
        </div>
        <div className="text-right">
          <SheetLabel>Payment status</SheetLabel>
          <div className="mt-2 text-[12.5px] text-foreground">{statusLabel(p.status)}</div>
          <div className="ml-auto mt-1 max-w-[36ch] text-[10.5px] leading-relaxed text-muted-foreground">
            {statusLine}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <RemittanceRow
          label="Gross fee"
          sub="Total billed to the client for this booking"
          value={money(p.gross_fee, p.currency)}
        />
        <RemittanceRow
          label={`Agency commission — ${Number.isNaN(rate) ? "" : rate}%`}
          sub="Candor Management share, snapshotted when the payment was raised"
          value={`− ${money(p.commission_amount, p.currency)}`}
        />
        <RemittanceRow
          label="Net payable to talent"
          value={money(p.net_talent_payment, p.currency)}
          strong
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-x-8">
        <div>
          <SheetLabel>Raised</SheetLabel>
          <div className="mt-1 text-[11.5px] text-foreground">{dateShort(p.created_at)}</div>
        </div>
        <div>
          <SheetLabel>Client paid</SheetLabel>
          <div className="mt-1 text-[11.5px] text-foreground">
            {dateShort(p.client_payment_date)}
          </div>
        </div>
        <div>
          <SheetLabel>Talent paid</SheetLabel>
          <div className="mt-1 text-[11.5px] text-foreground">
            {dateShort(p.talent_payment_date)}
          </div>
        </div>
      </div>

      <p className="mt-8 max-w-[64ch] text-[11px] leading-relaxed text-muted-foreground">
        This remittance advice is a statement of your share for the booking above. Net
        payment is transferred once the client has settled the invoice. Questions —
        contact@candor-management.com.
      </p>
    </>
  );
}

export default async function InvoiceStudioPage({ params, searchParams }) {
  await requireRole("booker", "md", "ceo");
  const { paymentId } = await params;
  const sp = await searchParams;
  const isRemittance = sp.type === "remittance";

  const payment = await getPaymentById(paymentId);
  if (!payment) notFound();

  const number = payment.invoice_number || "INV-DRAFT";

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: SHEET_CSS }} />

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/admin/invoicing"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to invoicing
        </Link>
        <InvoiceToolbar paymentId={paymentId} isRemittance={isRemittance} />
      </div>

      <div className="mt-6 pb-4">
        <div className="invoice-sheet mx-auto flex min-h-[280mm] w-full max-w-[210mm] flex-col border border-border bg-card p-[15mm] text-card-foreground shadow-lift">
          <Masthead
            docLabel={isRemittance ? "Talent remittance" : "Invoice"}
            number={number}
            issued={dateShort(payment.created_at)}
          />
          {isRemittance ? (
            <RemittanceBody payment={payment} />
          ) : (
            <ClientInvoiceBody payment={payment} />
          )}
          <SheetFooter />
        </div>
      </div>
    </div>
  );
}
