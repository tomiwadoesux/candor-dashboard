"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  FileText,
  MapPin,
  Receipt,
} from "lucide-react";
import { changeBookingStatus, toggleBookingFlags } from "@/lib/actions/bookings";
import { createPaymentForBooking } from "@/lib/actions/payments";
import {
  dateShort,
  dateLong,
  money,
  relativeTime,
  statusLabel,
  timeShort,
} from "@/lib/format";
import {
  StatusPill,
  bookingAccent,
  paymentAccent,
  accentText,
} from "@/components/admin/kit";
import {
  Field,
  FormError,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

// Valid status transitions per booking_status.
const TRANSITIONS = {
  casting_sent: ["pending", "confirmed", "cancelled"],
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function SectionHead({ label, meta }) {
  return (
    <div className="flex items-baseline justify-between pb-3">
      <div className="text-[11.5px] font-medium text-muted-foreground/70">
        {label}
      </div>
      {meta && (
        <span className="font-mono text-[10px] text-muted-foreground/70">{meta}</span>
      )}
    </div>
  );
}

export function BookingDetail({ booking: b, canManagePayments }) {
  return (
    <div>
      <div className="mt-6 flex items-baseline justify-between pb-2">
        <div className="text-[11.5px] font-medium text-muted-foreground/70">
          Bookings · {b.service_type || "Job"}
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          Created {dateShort(b.created_at)}
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-x-6 border-b border-border/60 pb-8">
        <div className="col-span-8 min-w-0">
          <h1 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
            <span>{b.project_title}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-muted-foreground">
            <span>{dateLong(b.booking_date)}</span>
            {b.booking_end_date && <span>→ {dateShort(b.booking_end_date)}</span>}
            {b.call_time && <span>Call {timeShort(b.call_time)}</span>}
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {statusLabel(b.location_city)}
              {b.location_address ? ` · ${b.location_address}` : ""}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 text-[12px] text-muted-foreground">
            {b.talent && (
              <Link
                href={`/admin/talent/${b.talent.id}`}
                className="inline-flex items-center gap-1 underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                {b.talent.first_name} {b.talent.last_name}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
            {b.client && (
              <Link
                href={`/admin/clients/${b.client.id}`}
                className="inline-flex items-center gap-1 underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                {b.client.company_name}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
        <div className="col-span-4 text-right">
          <div
            data-slot="numeric"
            className="text-[22px] font-semibold tracking-[-0.02em] leading-none text-foreground"
          >
            {money(b.talent_fee, b.fee_currency)}
          </div>
          {b.total_client_fee != null && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              Client fee {money(b.total_client_fee, b.fee_currency)}
            </div>
          )}
          <div className="mt-2">
            <StatusPill
              status={b.status}
              accent={bookingAccent(b.status)}
              className="text-[11px]"
            />
          </div>
        </div>
      </div>

      <StatusActions booking={b} />
      <DealTerms booking={b} />
      <FlagsSection booking={b} />
      <PaymentsSection booking={b} canManagePayments={canManagePayments} />
      <HistorySection history={b.status_history || []} />
      <DocumentsSection documents={b.documents || []} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function StatusActions({ booking: b }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);
  const nextStatuses = TRANSITIONS[b.status] || [];

  if (nextStatuses.length === 0) return null;

  return (
    <section className="mt-8">
      <SectionHead label="Move the booking" />
      {error && <FormError error={error} />}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {nextStatuses.map((s) => {
          const destructive = s === "cancelled";
          return (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => {
                if (destructive && !confirm("Cancel this booking? The talent will be notified.")) {
                  return;
                }
                setError(null);
                setTarget(s);
                startTransition(async () => {
                  const result = await changeBookingStatus(b.id, s);
                  if (result?.error) setError(result.error);
                  setTarget(null);
                });
              }}
              className={`pressable inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[11.5px] font-medium transition-colors disabled:opacity-60 ${
                destructive
                  ? "border-destructive/40 text-destructive hover:bg-destructive/5"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {pending && target === s ? (
                "Working…"
              ) : (
                <>
                  <ArrowRight className="h-3 w-3" />
                  {statusLabel(s)}
                </>
              )}
            </button>
          );
        })}
        <span className="text-[11px] text-muted-foreground">
          Talent is notified on every change.
        </span>
      </div>
    </section>
  );
}

function DealTerms({ booking: b }) {
  const rows = [
    ["Duration", b.duration_description],
    ["Media usage", b.media_usage],
    ["Territory", b.territory],
    ["Usage term", b.usage_term],
    ["Overtime", b.overtime_rate],
    ["Commission", b.talent?.commission_rate != null ? `${Number(b.talent.commission_rate)}%` : null],
  ].filter(([, v]) => v);

  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <SectionHead label="Deal terms" />
      {rows.length === 0 && !b.notes ? (
        <p className="py-2 text-[12px] text-muted-foreground">No terms recorded.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
            {rows.map(([label, value]) => (
              <div key={label}>
                <div className="text-[11.5px] font-medium text-muted-foreground/70">
                  {label}
                </div>
                <div className="mt-1 text-[13px] text-foreground">{value}</div>
              </div>
            ))}
          </div>
          {b.notes && (
            <p className="mt-5 max-w-[70ch] border-l border-border/60 pl-4 text-[12.5px] leading-relaxed text-muted-foreground">
              {b.notes}
            </p>
          )}
        </>
      )}
    </section>
  );
}

function FlagsSection({ booking: b }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function toggle(flags) {
    setError(null);
    startTransition(async () => {
      const result = await toggleBookingFlags(b.id, flags);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <SectionHead label="Paperwork flags" />
      {error && <FormError error={error} />}
      <div className="flex flex-wrap items-center gap-2">
        <FlagButton
          label="Pre-job brief"
          on={b.pre_job_brief_sent}
          disabled={pending}
          onClick={() => toggle({ preJobBriefSent: !b.pre_job_brief_sent })}
        />
        <FlagButton
          label="Call sheet"
          on={b.call_sheet_sent}
          disabled={pending}
          onClick={() => toggle({ callSheetSent: !b.call_sheet_sent })}
        />
      </div>
    </section>
  );
}

function FlagButton({ label, on, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`pressable inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[11.5px] font-medium transition-colors disabled:opacity-60 ${
        on
          ? "border-success/40 text-success"
          : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {on ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {label} · {on ? "sent" : "not sent"}
    </button>
  );
}

// ---------------------------------------------------------------------------

function PaymentsSection({ booking: b, canManagePayments }) {
  const payments = b.payments || [];
  const [showForm, setShowForm] = useState(false);
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const result = await createPaymentForBooking(prev, formData);
    if (result?.success) setShowForm(false);
    return result;
  }, undefined);

  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <SectionHead
        label="Payments"
        meta={`${payments.length} record${payments.length === 1 ? "" : "s"}`}
      />

      {payments.length === 0 ? (
        <p className="py-2 text-[12px] text-muted-foreground">
          No payment raised for this booking yet.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {payments.map((p) => (
            <li key={p.id} className="grid grid-cols-12 items-baseline gap-x-4 py-3.5">
              <div className="col-span-3 font-mono text-[11px] text-muted-foreground">
                {p.invoice_number || "No invoice №"}
              </div>
              <div
                data-slot="numeric"
                className="col-span-2 text-right text-[13.5px] font-medium text-foreground"
              >
                {money(p.gross_fee, p.currency)}
              </div>
              <div
                data-slot="numeric"
                className="col-span-2 text-right font-mono text-[11.5px] text-muted-foreground"
              >
                net {money(p.net_talent_payment, p.currency)}
              </div>
              <div className="col-span-3 text-right">
                <StatusPill status={p.status} accent={paymentAccent(p.status)} />
              </div>
              <div className="col-span-2 text-right">
                <Link
                  href={`/admin/invoicing/${p.id}/invoice`}
                  className="pressable inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-brand"
                >
                  <FileText className="h-3 w-3" />
                  Invoice
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManagePayments && (
        <div className="mt-4">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="pressable inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              <Receipt className="h-3 w-3" />
              Raise payment
            </button>
          ) : (
            <form
              action={action}
              className="space-y-4 rounded-sm border border-border/60 bg-muted/20 p-5"
            >
              <input type="hidden" name="bookingId" value={b.id} />
              <div className="text-[11.5px] font-medium text-muted-foreground/70">
                New payment · commission snapshots at{" "}
                {b.talent?.commission_rate != null
                  ? `${Number(b.talent.commission_rate)}%`
                  : "the talent's current rate"}
              </div>
              <FormError error={state?.error} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field
                  label="Gross fee"
                  hint={`Defaults to the booking fee — ${money(b.talent_fee, b.fee_currency)}.`}
                >
                  <input name="grossFee" type="number" step="0.01" min="0" className={inputClass} />
                </Field>
                <Field label="Invoice number">
                  <input name="invoiceNumber" className={inputClass} placeholder="CAN-2026-001" />
                </Field>
                <Field label="Notes">
                  <input name="notes" className={inputClass} />
                </Field>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="pressable inline-flex h-9 items-center rounded-full px-3.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <SubmitButton pending={pending}>
                  {pending ? "Raising…" : "Raise payment"}
                </SubmitButton>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------

function HistorySection({ history }) {
  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <SectionHead label="Status history" meta={`${history.length} entries`} />
      {history.length === 0 ? (
        <p className="py-2 text-[12px] text-muted-foreground">No history yet.</p>
      ) : (
        <ol className="relative space-y-0 border-l border-border/60 pl-5">
          {history.map((h) => (
            <li key={h.id} className="relative pb-5 last:pb-0">
              <span
                className={`absolute -left-[23px] top-1.5 h-2 w-2 rounded-full ring-2 ring-background ${
                  bookingAccent(h.new_status) === "success"
                    ? "bg-success"
                    : bookingAccent(h.new_status) === "destructive"
                      ? "bg-destructive"
                      : bookingAccent(h.new_status) === "brand"
                        ? "bg-brand"
                        : "bg-muted-foreground"
                }`}
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span
                  className={`text-[11.5px] font-medium ${accentText(bookingAccent(h.new_status))}`}
                >
                  {h.old_status
                    ? `${statusLabel(h.old_status)} → ${statusLabel(h.new_status)}`
                    : statusLabel(h.new_status)}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {relativeTime(h.created_at)} · {dateShort(h.created_at)}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                {h.changed_by?.full_name || "System"}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function DocumentsSection({ documents }) {
  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <SectionHead label="Documents" meta={`${documents.length} on file`} />
      {documents.length === 0 ? (
        <p className="py-2 text-[12px] text-muted-foreground">
          No documents linked to this booking.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {documents.map((d) => (
            <li key={d.id} className="py-3">
              <a
                href={d.file_url}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-12 items-baseline gap-x-4"
              >
                <div className="col-span-7 flex min-w-0 items-center gap-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-[13.5px] font-medium text-foreground group-hover:underline">
                    {d.title}
                  </span>
                </div>
                <div className="col-span-3 text-[11.5px] font-medium text-muted-foreground">
                  {statusLabel(d.document_type)}
                </div>
                <div className="col-span-2 text-right font-mono text-[11px] text-muted-foreground">
                  {dateShort(d.created_at)}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
