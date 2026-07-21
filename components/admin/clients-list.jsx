"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, Phone, Plus, Search, X } from "lucide-react";
import { createClient_ } from "@/lib/actions/clients";
import { dateShort, statusLabel } from "@/lib/format";
import { StatusPill, EmptyRow } from "@/components/admin/kit";
import {
  Field,
  FormError,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

const TYPE_FILTERS = [
  { id: "", label: "All" },
  { id: "new", label: "New" },
  { id: "established", label: "Established" },
];

function filterHref({ q, type }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  const s = params.toString();
  return `/admin/clients${s ? `?${s}` : ""}`;
}

export function ClientsList({ clients, q = "", type = "" }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTERS.map((f) => {
            const active = type === f.id;
            return (
              <Link
                key={f.id || "all"}
                href={filterHref({ q, type: f.id })}
                className={`pressable inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] transition-colors ${
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
        <form
          action="/admin/clients"
          className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground focus-within:border-foreground/50"
        >
          {type && <input type="hidden" name="type" value={type} />}
          <Search className="h-3 w-3" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search company name"
            className="w-44 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="submit"
            className="pressable text-[11.5px] font-medium text-muted-foreground hover:text-foreground"
          >
            Go
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="pressable inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          {showCreate ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {showCreate ? "Close" : "Add client"}
        </button>
      </div>

      {showCreate && <CreateClientForm onDone={() => setShowCreate(false)} />}

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {clients.map((c, i) => (
          <li key={c.id}>
            <Link
              href={`/admin/clients/${c.id}`}
              className="group grid grid-cols-12 items-start gap-x-4 py-5 transition-colors hover:bg-muted/30"
            >
              <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                №{String(i + 1).padStart(3, "0")}
              </div>
              <div className="col-span-5 min-w-0">
                <div className="flex items-baseline gap-3">
                  <h3 className="truncate text-[15px] font-semibold text-foreground">
                    {c.company_name}
                  </h3>
                  <span className="shrink-0 text-[11.5px] font-medium text-muted-foreground">
                    {statusLabel(c.client_type)}
                  </span>
                </div>
                {c.contact_person && (
                  <div className="mt-1 text-[11.5px] text-muted-foreground">
                    {c.contact_person}
                  </div>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/80">
                  {c.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[11.5px] font-medium text-muted-foreground/70">
                  Terms
                </div>
                <div className="mt-0.5 text-[12px] text-foreground">
                  {c.payment_terms || "—"}
                </div>
              </div>
              <div className="col-span-2 text-right">
                <div className="text-[11.5px] font-medium text-muted-foreground/70">
                  Bookings
                </div>
                <div
                  data-slot="numeric"
                  className="mt-0.5 text-[15px] font-semibold leading-none text-foreground"
                >
                  {c.bookingsCount ?? 0}
                </div>
                <div className="mt-1 text-[10.5px] text-muted-foreground">
                  Since {dateShort(c.created_at)}
                </div>
              </div>
              <div className="col-span-2 flex items-start justify-end gap-2 text-right">
                <StatusPill
                  status={c.is_active ? "active" : "inactive"}
                  accent={c.is_active ? "success" : "muted"}
                />
                <ArrowUpRight className="mt-0.5 h-3 w-3 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
            </Link>
          </li>
        ))}
        {clients.length === 0 && (
          <EmptyRow>No clients yet — add the first one above.</EmptyRow>
        )}
      </ul>
    </>
  );
}

function CreateClientForm({ onDone }) {
  const [state, action, pending] = useActionState(createClient_, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form
      action={action}
      className="mt-5 space-y-4 rounded-sm border border-border/60 bg-muted/20 p-5"
    >
      <div className="text-[11.5px] font-medium text-muted-foreground/70">
        New client
      </div>
      <FormError error={state?.error} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Company name *">
          <input name="companyName" required className={inputClass} />
        </Field>
        <Field label="Contact person">
          <input name="contactPerson" className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" className={inputClass} />
        </Field>
        <Field label="Client type">
          <select name="clientType" defaultValue="new" className={inputClass}>
            <option value="new">New — 100% upfront</option>
            <option value="established">Established — Net 14</option>
          </select>
        </Field>
        <Field label="Payment terms" hint="Leave blank for the house default.">
          <input name="paymentTerms" className={inputClass} placeholder="e.g. Net 14" />
        </Field>
      </div>
      <Field label="Address">
        <input name="address" className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea name="notes" rows={2} className={`${inputClass} resize-none`} />
      </Field>
      <div className="flex justify-end">
        <SubmitButton pending={pending}>
          {pending ? "Saving…" : "Add client"}
        </SubmitButton>
      </div>
    </form>
  );
}
