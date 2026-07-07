"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Lock,
  MapPin,
  Star,
  XCircle,
} from "lucide-react";
import {
  shortlistInterest,
  selectInterest,
  closeCasting,
  convertCastingToBooking,
} from "@/lib/actions/castings";
import { dateShort, relativeTime, statusLabel } from "@/lib/format";
import { StatusPill } from "@/components/admin/kit";
import {
  Field,
  FormError,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

function castingAccent(status) {
  if (status === "open") return "success";
  if (status === "cancelled") return "destructive";
  return "muted";
}

export function CastingDetail({ casting: c }) {
  const interests = c.interests || [];
  const interested = interests.filter((i) => i.response === "interested");
  const shortlisted = interests.filter((i) => i.shortlisted);
  const selected = interests.filter((i) => i.selected);

  const [rowError, setRowError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [closingPending, startClosing] = useTransition();
  const [, startRow] = useTransition();

  function runRowAction(id, fn) {
    setRowError(null);
    setBusyId(id);
    startRow(async () => {
      const result = await fn();
      if (result?.error) setRowError(result.error);
      setBusyId(null);
    });
  }

  return (
    <div>
      <div className="mt-6 flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Casting · {statusLabel(c.category)}
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          Posted {dateShort(c.created_at)}
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-x-6 border-b border-border/60 pb-8">
        <div className="col-span-8 min-w-0">
          <h1 className="font-serif text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
            <span className="editorial-italic">{c.title}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {statusLabel(c.location)}
            </span>
            <span>
              Shoot {dateShort(c.shoot_date_start)}
              {c.shoot_date_end ? ` – ${dateShort(c.shoot_date_end)}` : ""}
            </span>
            <span>
              Deadline {dateShort(c.deadline)} ({relativeTime(c.deadline)})
            </span>
            {c.work_type && <span>{c.work_type}</span>}
          </div>
          {c.description && (
            <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-muted-foreground">
              {c.description}
            </p>
          )}
          {c.requirements && (
            <p className="mt-2 max-w-[68ch] border-l border-border/60 pl-4 font-serif text-[13.5px] font-light italic leading-relaxed text-muted-foreground">
              {c.requirements}
            </p>
          )}
          {(c.brand_name_internal || c.client) && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-warning/10 px-2 py-1 text-[10.5px] uppercase tracking-[0.12em] text-warning">
              <Lock className="h-3 w-3" />
              Internal · {c.brand_name_internal || c.client?.company_name}
              {c.brand_name_internal && c.client ? ` (${c.client.company_name})` : ""}
            </div>
          )}
        </div>
        <div className="col-span-4 flex flex-col items-end gap-3 text-right">
          <StatusPill status={c.status} accent={castingAccent(c.status)} className="text-[11px]" />
          <div>
            <div
              data-slot="numeric"
              className="font-serif text-[30px] font-light leading-none text-foreground"
            >
              {interested.length}
              <span className="text-[15px] text-muted-foreground">/{interests.length}</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              interested / responses
            </div>
          </div>
          {c.status === "open" && (
            <button
              type="button"
              disabled={closingPending}
              onClick={() => {
                if (!confirm("Close this casting?")) return;
                startClosing(async () => {
                  const result = await closeCasting(c.id);
                  if (result?.error) setRowError(result.error);
                });
              }}
              className="pressable inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-60"
            >
              <XCircle className="h-3 w-3" />
              {closingPending ? "Closing…" : "Close casting"}
            </button>
          )}
        </div>
      </div>

      {rowError && (
        <div className="mt-6">
          <FormError error={rowError} />
        </div>
      )}

      <section className="mt-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Expressions of interest
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {shortlisted.length} shortlisted · {selected.length} selected
          </span>
        </div>

        {interests.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-muted-foreground">
            No responses yet — the board is live for talent while the casting is open.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {interests.map((i) => (
              <InterestRow
                key={i.id}
                interest={i}
                busy={busyId === i.id}
                onShortlist={(next) =>
                  runRowAction(i.id, () => shortlistInterest(i.id, next))
                }
                onSelect={() => runRowAction(i.id, () => selectInterest(i.id))}
              />
            ))}
          </ul>
        )}
      </section>

      {selected.length > 0 && (
        <ConvertSection casting={c} selected={selected} />
      )}
    </div>
  );
}

function InterestRow({ interest: i, busy, onShortlist, onSelect }) {
  const t = i.talent;
  const m = t?.measurements;
  const notAvailable = i.response !== "interested";

  return (
    <li className={`py-5 ${notAvailable ? "opacity-60" : ""}`}>
      <div className="grid grid-cols-12 items-start gap-x-4">
        <div className="col-span-5 flex min-w-0 items-center gap-4">
          {t?.polaroid_url ? (
            <Image
              src={t.polaroid_url}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-border/60"
            />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted/60 font-serif text-[15px] font-light italic text-foreground ring-1 ring-border/60">
              {t?.first_name?.[0]}
              {t?.last_name?.[0]}
            </span>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/talent/${t?.id}`}
              className="group inline-flex items-baseline gap-1.5"
            >
              <span className="truncate font-serif text-[18px] font-light text-foreground group-hover:underline">
                {t?.first_name} {t?.last_name}
              </span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground/40" />
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
              <span className="uppercase tracking-[0.1em]">{statusLabel(t?.category)}</span>
              <span>·</span>
              <span>{statusLabel(t?.primary_location)}</span>
            </div>
            {m && (
              <div className="mt-1 font-mono text-[10px] text-muted-foreground/80">
                {[
                  m.height_display,
                  m.bust && `B${m.bust}`,
                  m.waist && `W${m.waist}`,
                  m.hips && `H${m.hips}`,
                  m.shoe_uk && `Shoe UK ${m.shoe_uk}`,
                  m.dress_size && `Dress ${m.dress_size}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-3">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
            Response · {relativeTime(i.created_at)}
          </div>
          <div
            className={`mt-1 text-[12px] uppercase tracking-[0.1em] ${
              notAvailable ? "text-muted-foreground" : "text-success"
            }`}
          >
            {statusLabel(i.response)}
          </div>
          {i.calendar_conflict && (
            <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-warning">
              <AlertTriangle className="h-3 w-3" />
              {i.conflict_details || "Calendar conflict"}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
            Stage
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.12em]">
            {i.selected ? (
              <span className="inline-flex items-center gap-1 text-bronze">
                <Star className="h-3 w-3 fill-current" /> Selected
              </span>
            ) : i.shortlisted ? (
              <span className="text-bronze">Shortlisted</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-end gap-1.5">
          {!i.selected && !notAvailable && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onShortlist(!i.shortlisted)}
                className="pressable inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-bronze hover:text-bronze disabled:opacity-60"
              >
                {i.shortlisted ? "Remove shortlist" : "Shortlist"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (
                    confirm(
                      `Select ${t?.first_name}? The brand is revealed to them privately.`
                    )
                  ) {
                    onSelect();
                  }
                }}
                className="pressable inline-flex h-7 items-center gap-1 rounded-full bg-foreground px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-background disabled:opacity-60"
              >
                <Check className="h-3 w-3" />
                Select
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function ConvertSection({ casting: c, selected }) {
  const [state, action, pending] = useActionState(convertCastingToBooking, undefined);

  return (
    <section className="mt-12 rounded-sm border border-bronze/30 bg-bronze/[0.04] p-5">
      <div className="border-b border-bronze/20 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-bronze">
        Convert to booking
      </div>
      {state?.success && state.bookingId ? (
        <div className="mt-4 flex items-center gap-3 text-[13px] text-success">
          <Check className="h-4 w-4" />
          Booking created.
          <Link
            href={`/admin/bookings/${state.bookingId}`}
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
          >
            Open it <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="castingId" value={c.id} />
          <FormError error={state?.error} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field label="Selected talent *">
              <select name="talentId" required defaultValue={selected[0]?.talent?.id} className={inputClass}>
                {selected.map((i) => (
                  <option key={i.id} value={i.talent?.id}>
                    {i.talent?.first_name} {i.talent?.last_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Talent fee *">
              <input
                name="talentFee"
                type="number"
                step="0.01"
                min="0"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Currency">
              <select name="feeCurrency" defaultValue="NGN" className={inputClass}>
                <option value="NGN">NGN — ₦</option>
                <option value="GBP">GBP — £</option>
                <option value="USD">USD — $</option>
              </select>
            </Field>
            <Field label="Initial status">
              <select name="status" defaultValue="confirmed" className={inputClass}>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            </Field>
          </div>
          {!c.client && (
            <p className="text-[11.5px] text-warning">
              This casting has no linked client — link one on the casting before converting.
            </p>
          )}
          <div className="flex justify-end">
            <SubmitButton pending={pending}>
              {pending ? "Converting…" : "Create booking"}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}
