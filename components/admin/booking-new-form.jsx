"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/lib/actions/bookings";
import {
  Field,
  FormError,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

export function BookingNewForm({
  talent = [],
  clients = [],
  initialTalentId = "",
  initialClientId = "",
  defaults = {},
}) {
  const [state, action, pending] = useActionState(createBooking, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.bookingId) {
      router.push(`/admin/bookings/${state.bookingId}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-8">
      <FormError error={state?.error} />

      <section>
        <div className="border-b border-border/60 pb-2 text-[11.5px] font-medium text-muted-foreground/70">
          Who
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Talent *">
            <select
              name="talentId"
              required
              defaultValue={initialTalentId}
              className={inputClass}
            >
              <option value="" disabled>
                Select talent…
              </option>
              {talent.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.status !== "active" ? ` (${t.status})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Client *">
            <select
              name="clientId"
              required
              defaultValue={initialClientId}
              className={inputClass}
            >
              <option value="" disabled>
                Select client…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? "" : " (inactive)"}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <div className="border-b border-border/60 pb-2 text-[11.5px] font-medium text-muted-foreground/70">
          The job
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Project title *" className="md:col-span-2">
            <input
              name="projectTitle"
              required
              defaultValue={defaults.projectTitle}
              className={inputClass}
              placeholder="SS26 campaign — hero film"
            />
          </Field>
          <Field label="Service type">
            <input
              name="serviceType"
              className={inputClass}
              placeholder="Campaign shoot, editorial…"
            />
          </Field>
          <Field label="Initial status">
            <select name="status" defaultValue="pending" className={inputClass}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="casting_sent">Casting sent</option>
            </select>
          </Field>
          <Field label="Booking date *">
            <input
              name="bookingDate"
              type="date"
              required
              defaultValue={defaults.bookingDate}
              className={inputClass}
            />
          </Field>
          <Field label="End date">
            <input name="bookingEndDate" type="date" className={inputClass} />
          </Field>
          <Field label="Call time">
            <input name="callTime" type="time" className={inputClass} />
          </Field>
          <Field label="Duration">
            <input
              name="durationDescription"
              className={inputClass}
              placeholder="Full day, half day…"
            />
          </Field>
          <Field label="Location city *">
            <select name="locationCity" required defaultValue="lagos" className={inputClass}>
              <option value="lagos">Lagos</option>
              <option value="london">London</option>
              <option value="usa_other">USA / Other</option>
            </select>
          </Field>
          <Field label="Location address">
            <input name="locationAddress" className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <div className="border-b border-border/60 pb-2 text-[11.5px] font-medium text-muted-foreground/70">
          Money
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Talent fee (gross) *">
            <input
              name="talentFee"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaults.talentFee}
              className={inputClass}
            />
          </Field>
          <Field label="Currency">
            <select
              name="feeCurrency"
              defaultValue={defaults.feeCurrency || "NGN"}
              className={inputClass}
            >
              <option value="NGN">NGN — ₦</option>
              <option value="GBP">GBP — £</option>
              <option value="USD">USD — $</option>
            </select>
          </Field>
          <Field label="Total client fee" hint="If different from the talent fee.">
            <input name="totalClientFee" type="number" step="0.01" min="0" className={inputClass} />
          </Field>
          <Field label="Overtime rate">
            <input
              name="overtimeRate"
              className={inputClass}
              placeholder="1.5x hourly pro-rated"
            />
          </Field>
        </div>
      </section>

      <section>
        <div className="border-b border-border/60 pb-2 text-[11.5px] font-medium text-muted-foreground/70">
          Usage
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Media usage">
            <input
              name="mediaUsage"
              defaultValue={defaults.mediaUsage}
              className={inputClass}
              placeholder="Digital + OOH"
            />
          </Field>
          <Field label="Territory">
            <input name="territory" className={inputClass} placeholder="Nigeria, worldwide…" />
          </Field>
          <Field label="Usage term">
            <input name="usageTerm" className={inputClass} placeholder="12 months" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Notes">
            <textarea
              name="notes"
              rows={3}
              defaultValue={defaults.notes}
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end border-t border-border/60 pt-5">
        <SubmitButton pending={pending}>
          {pending ? "Creating booking…" : "Create booking"}
        </SubmitButton>
      </div>
    </form>
  );
}
