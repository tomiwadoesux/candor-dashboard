"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateShort } from "@/lib/format";
import { submitMilestone } from "@/lib/actions/milestones";

const inputClass =
  "w-full rounded-lg border border-input bg-surface px-3 text-[13px] text-foreground transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] placeholder:text-muted-foreground/50 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-ring";

export function MilestoneSubmitForm({ bookings }) {
  const [state, formAction, pending] = useActionState(submitMilestone, undefined);

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-6 text-center">
        <p className="text-[13.5px] font-medium text-foreground">
          {state?.success
            ? "Thanks — your win is with Candor for review."
            : "No completed bookings to share yet"}
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {state?.success
            ? "It appears on the wall once approved."
            : "Once a job wraps, you can put it on the wall here."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-5">
      <label
        htmlFor="milestone-booking"
        className="block text-[12.5px] font-medium text-foreground/90"
      >
        Which booking?
      </label>
      <select
        id="milestone-booking"
        name="bookingId"
        required
        defaultValue=""
        className={cn(inputClass, "mt-1.5 h-9")}
      >
        <option value="" disabled>
          Pick a completed booking…
        </option>
        {bookings.map((b) => (
          <option key={b.id} value={b.id}>
            {b.project_title} — {dateShort(b.booking_date)}
          </option>
        ))}
      </select>

      <fieldset className="mt-4">
        <legend className="text-[12.5px] font-medium text-foreground/90">
          Visibility
        </legend>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {[
            { value: "named", label: "Share my name" },
            { value: "anonymous", label: "Keep me anonymous" },
          ].map((opt, i) => (
            <label
              key={opt.value}
              className={cn(
                "flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-[12.5px] font-medium transition-colors duration-140",
                "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                "has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-soft-foreground"
              )}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                defaultChecked={i === 0}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label
        htmlFor="milestone-text"
        className="mt-4 block text-[12.5px] font-medium text-foreground/90"
      >
        Your line{" "}
        <span className="font-normal text-muted-foreground/60">
          (optional — we&apos;ll write one if blank)
        </span>
      </label>
      <textarea
        id="milestone-text"
        name="displayText"
        rows={2}
        maxLength={500}
        placeholder="e.g. Landed my first international campaign…"
        className={cn(inputClass, "mt-1.5 resize-none py-2")}
      />

      {state?.error && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-success">
          <Check className="h-3.5 w-3.5" />
          Submitted — it appears on the wall once Candor approves it.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="pressable mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Send to Candor"}
      </button>
    </form>
  );
}
