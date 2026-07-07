"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Pencil, Phone, X } from "lucide-react";
import { updateClient, toggleClientActive } from "@/lib/actions/clients";
import { dateShort, money, statusLabel } from "@/lib/format";
import { StatusPill, bookingAccent, EmptyRow } from "@/components/admin/kit";
import {
  Field,
  FormError,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

export function ClientDetail({ client: c }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const result = await updateClient(prev, formData);
    if (result?.success) setEditing(false);
    return result;
  }, undefined);
  const [togglePending, startToggle] = useTransition();
  const [toggleError, setToggleError] = useState(null);

  const totals = Object.entries(c.paymentTotals || {});

  return (
    <div>
      <div className="mt-6 flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Clients · {statusLabel(c.client_type)}
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          On file since {dateShort(c.created_at)}
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-8">
        <div className="min-w-0">
          <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
            <span className="editorial-italic">{c.company_name}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-muted-foreground">
            {c.contact_person && <span>{c.contact_person}</span>}
            {c.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> {c.email}
              </span>
            )}
            {c.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {c.phone}
              </span>
            )}
            {c.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {c.address}
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Terms · {c.payment_terms || "House default"}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <StatusPill
            status={c.is_active ? "active" : "inactive"}
            accent={c.is_active ? "success" : "muted"}
            className="text-[11px]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="pressable inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {editing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              type="button"
              disabled={togglePending}
              onClick={() => {
                setToggleError(null);
                startToggle(async () => {
                  const result = await toggleClientActive(c.id, !c.is_active);
                  if (result?.error) setToggleError(result.error);
                });
              }}
              className="pressable inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-60"
            >
              {togglePending ? "Saving…" : c.is_active ? "Deactivate" : "Reactivate"}
            </button>
          </div>
          {toggleError && <div className="text-[11px] text-destructive">{toggleError}</div>}
        </div>
      </div>

      {editing && (
        <form
          action={action}
          className="mt-8 space-y-4 rounded-sm border border-border/60 bg-muted/20 p-5"
        >
          <input type="hidden" name="id" value={c.id} />
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Edit client
          </div>
          <FormError error={state?.error} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Company name">
              <input name="companyName" defaultValue={c.company_name} className={inputClass} />
            </Field>
            <Field label="Contact person">
              <input
                name="contactPerson"
                defaultValue={c.contact_person || ""}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={c.email || ""} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={c.phone || ""} className={inputClass} />
            </Field>
            <Field label="Client type">
              <select name="clientType" defaultValue={c.client_type} className={inputClass}>
                <option value="new">New</option>
                <option value="established">Established</option>
              </select>
            </Field>
            <Field label="Payment terms">
              <input
                name="paymentTerms"
                defaultValue={c.payment_terms || ""}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Address">
            <input name="address" defaultValue={c.address || ""} className={inputClass} />
          </Field>
          <Field label="Notes">
            <textarea
              name="notes"
              rows={2}
              defaultValue={c.notes || ""}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pending={pending}>
              {pending ? "Saving…" : "Save client"}
            </SubmitButton>
          </div>
        </form>
      )}

      {c.notes && !editing && (
        <p className="mt-6 max-w-[70ch] text-[12.5px] leading-relaxed text-muted-foreground">
          {c.notes}
        </p>
      )}

      <section className="mt-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Money · per currency
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Gross / commission / net / outstanding
          </span>
        </div>
        {totals.length === 0 ? (
          <p className="py-4 text-[12px] text-muted-foreground">
            No payments recorded for this client yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {totals.map(([cur, tot]) => (
              <li key={cur} className="grid grid-cols-12 items-baseline gap-x-4 py-4">
                <div className="col-span-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {cur}
                </div>
                <MoneyCell label="Gross" value={money(tot.gross, cur)} />
                <MoneyCell label="Commission" value={money(tot.commission, cur)} accent="text-bronze" />
                <MoneyCell label="Net to talent" value={money(tot.net, cur)} />
                <MoneyCell
                  label="Outstanding"
                  value={tot.outstanding ? money(tot.outstanding, cur) : "—"}
                  accent={tot.outstanding ? "text-warning" : "text-muted-foreground"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Bookings
          </div>
          <span data-slot="numeric" className="font-mono text-[10px] text-muted-foreground/70">
            {c.bookings?.length ?? 0} on record
          </span>
        </div>
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {(c.bookings || []).map((b, i) => (
            <li key={b.id}>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="group grid grid-cols-12 items-baseline gap-x-4 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  №{String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-2 font-mono text-[11px] text-foreground">
                  {dateShort(b.booking_date)}
                </div>
                <div className="col-span-4 min-w-0">
                  <h3 className="truncate font-serif text-[17px] font-light text-foreground">
                    {b.project_title}
                  </h3>
                  <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/80">
                    {b.service_type || "—"}
                    {b.talent && ` · ${b.talent.first_name} ${b.talent.last_name}`}
                  </div>
                </div>
                <div
                  data-slot="numeric"
                  className="col-span-2 text-right font-serif text-[16px] font-light text-foreground"
                >
                  {money(b.talent_fee, b.fee_currency)}
                </div>
                <div className="col-span-2 text-right">
                  <StatusPill status={b.status} accent={bookingAccent(b.status)} />
                </div>
                <div className="col-span-1 text-right">
                  <ArrowUpRight className="ml-auto h-3 w-3 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </Link>
            </li>
          ))}
          {(c.bookings || []).length === 0 && (
            <EmptyRow>
              No bookings yet —{" "}
              <Link href="/admin/bookings/new" className="underline hover:text-foreground">
                create the first one
              </Link>
              .
            </EmptyRow>
          )}
        </ul>
      </section>
    </div>
  );
}

function MoneyCell({ label, value, accent = "text-foreground" }) {
  return (
    <div className="col-span-2 text-right md:col-span-2">
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div data-slot="numeric" className={`mt-0.5 font-serif text-[17px] font-light ${accent}`}>
        {value}
      </div>
    </div>
  );
}
