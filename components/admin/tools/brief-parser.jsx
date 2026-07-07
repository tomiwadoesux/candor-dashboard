"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { parseBrief } from "@/lib/actions/tools";
import { statusLabel } from "@/lib/format";
import {
  Field,
  FormError,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

const CATEGORIES = [
  "model",
  "photographer",
  "creative_director",
  "visual_artist",
  "artisan",
  "graphic_designer",
  "content_creator",
  "influencer",
  "brand_partner",
  "educator",
];
const LOCATIONS = ["lagos", "london", "usa_other"];
const CURRENCIES = ["NGN", "GBP", "USD"];

function buildHref(base, entries) {
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    const v = value == null ? "" : String(value).trim();
    if (v) params.set(key, v);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function BriefParser() {
  const [state, action, pending] = useActionState(parseBrief, undefined);

  // User edits are kept as overrides on top of the last parse result; a new
  // parse (new `base` identity) resets them without needing an effect.
  const [override, setOverride] = useState({ base: null, edits: {} });
  const base = state?.success && state.parsed ? state.parsed : null;
  const edits = override.base === base ? override.edits : {};
  const fields = base ? { ...base, ...edits } : null;

  const set = (key) => (e) =>
    setOverride({ base, edits: { ...edits, [key]: e.target.value } });

  const errorMessage =
    state?.error === "unavailable"
      ? "AI is unreachable — check HF_TOKEN / try again."
      : state?.error;

  const castingHref =
    fields &&
    buildHref("/admin/casting/new", [
      ["title", fields.title],
      ["category", fields.category],
      ["location", fields.location],
      ["shootDateStart", fields.shootDateStart],
      ["shootDateEnd", fields.shootDateEnd],
      ["deadline", fields.deadline],
      ["workType", fields.workType],
      ["mediaUsage", fields.mediaUsage],
      ["requirements", fields.requirements],
      ["brandName", fields.brandName],
      ["description", fields.description],
    ]);

  const bookingHref =
    fields &&
    buildHref("/admin/bookings/new", [
      ["projectTitle", fields.title],
      ["bookingDate", fields.shootDateStart],
      ["feeCurrency", fields.currency],
      ["talentFee", fields.budget],
      ["mediaUsage", fields.mediaUsage],
      ["notes", fields.notes ?? fields.description],
    ]);

  const ctaClass = (primary) =>
    primary
      ? "pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-background"
      : "pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-foreground hover:border-foreground/40";

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-4">
        <FormError error={errorMessage} />
        <Field
          label="The brief"
          hint="The AI never sees your roster or client list — only this text."
        >
          <textarea
            name="brief"
            rows={8}
            required
            minLength={20}
            className={`${inputClass} resize-y`}
            placeholder="Paste the client's brief — email, WhatsApp, anything."
          />
        </Field>
        <div className="flex items-center justify-end">
          <SubmitButton pending={pending}>
            <Sparkles className="h-3.5 w-3.5" />
            {pending ? "Parsing…" : "Parse brief"}
          </SubmitButton>
        </div>
      </form>

      {fields && (
        <div className="stagger-in space-y-6">
          <section className="rounded-sm border border-border bg-card p-5">
            <div className="border-b border-border/60 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              Extracted fields · review and edit before creating
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Kind">
                <select
                  value={fields.kind ?? "casting"}
                  onChange={set("kind")}
                  className={inputClass}
                >
                  <option value="casting">Casting</option>
                  <option value="booking">Booking</option>
                </select>
              </Field>
              <Field label="Title">
                <input
                  value={fields.title ?? ""}
                  onChange={set("title")}
                  className={inputClass}
                />
              </Field>
              <Field label="Category">
                <select
                  value={fields.category ?? ""}
                  onChange={set("category")}
                  className={inputClass}
                >
                  <option value="">Not detected</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {statusLabel(c)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location">
                <select
                  value={fields.location ?? ""}
                  onChange={set("location")}
                  className={inputClass}
                >
                  <option value="">Not detected</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {statusLabel(l)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Shoot start">
                <input
                  type="date"
                  value={fields.shootDateStart ?? ""}
                  onChange={set("shootDateStart")}
                  className={inputClass}
                />
              </Field>
              <Field label="Shoot end">
                <input
                  type="date"
                  value={fields.shootDateEnd ?? ""}
                  onChange={set("shootDateEnd")}
                  className={inputClass}
                />
              </Field>
              <Field label="Deadline for interest">
                <input
                  type="date"
                  value={fields.deadline ?? ""}
                  onChange={set("deadline")}
                  className={inputClass}
                />
              </Field>
              <Field label="Work type">
                <input
                  value={fields.workType ?? ""}
                  onChange={set("workType")}
                  className={inputClass}
                  placeholder="Stills, film, runway…"
                />
              </Field>
              <Field label="Media usage" className="md:col-span-2">
                <input
                  value={fields.mediaUsage ?? ""}
                  onChange={set("mediaUsage")}
                  className={inputClass}
                  placeholder="Digital + print, 12 months"
                />
              </Field>
              <Field label="Budget">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fields.budget ?? ""}
                  onChange={set("budget")}
                  className={inputClass}
                />
              </Field>
              <Field label="Currency">
                <select
                  value={fields.currency ?? ""}
                  onChange={set("currency")}
                  className={inputClass}
                >
                  <option value="">Not detected</option>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Brand name"
                className="md:col-span-2"
                hint="Internal only — never shown to talent until selection."
              >
                <input
                  value={fields.brandName ?? ""}
                  onChange={set("brandName")}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Description">
                <textarea
                  rows={3}
                  value={fields.description ?? ""}
                  onChange={set("description")}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field label="Requirements">
                <textarea
                  rows={2}
                  value={fields.requirements ?? ""}
                  onChange={set("requirements")}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </section>

          {fields.notes && (
            <section className="rounded-sm border border-border/60 bg-muted/20 p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                Model&rsquo;s notes
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-muted-foreground">
                {fields.notes}
              </p>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/60 pt-5">
            <Link href={castingHref} className={ctaClass(fields.kind !== "booking")}>
              Create casting
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href={bookingHref} className={ctaClass(fields.kind === "booking")}>
              Create booking
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
