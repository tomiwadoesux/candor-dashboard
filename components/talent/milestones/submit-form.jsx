"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateShort } from "@/lib/format";
import { submitMilestone } from "@/lib/actions/milestones";

export function MilestoneSubmitForm({ bookings }) {
  const [state, formAction, pending] = useActionState(submitMilestone, undefined);

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-6 text-center">
        <p className="font-serif text-[15px] italic text-foreground/90">
          {state?.success
            ? "Thanks — your win is with Candor for review."
            : "No completed bookings to share yet."}
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
        className="block text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70"
      >
        Which booking?
      </label>
      <select
        id="milestone-booking"
        name="bookingId"
        required
        defaultValue=""
        className="mt-2 h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground focus:border-border-strong focus:outline-none"
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

      <fieldset className="mt-5">
        <legend className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
          Visibility
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[
            { value: "named", label: "Share my name" },
            { value: "anonymous", label: "Keep me anonymous" },
          ].map((opt, i) => (
            <label
              key={opt.value}
              className={cn(
                "flex h-9 cursor-pointer items-center justify-center rounded-full border px-3 text-[12px] font-medium transition-colors",
                "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                "has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
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
        className="mt-5 block text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70"
      >
        Your line{" "}
        <span className="lowercase text-muted-foreground/50">
          (optional — we&apos;ll write one if blank)
        </span>
      </label>
      <textarea
        id="milestone-text"
        name="displayText"
        rows={2}
        maxLength={500}
        placeholder="e.g. Landed my first international campaign…"
        className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-border-strong focus:outline-none"
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
        className="pressable mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-[12.5px] font-medium text-background transition-opacity disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Send to Candor"}
      </button>
    </form>
  );
}
