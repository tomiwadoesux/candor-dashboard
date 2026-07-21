"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, PenLine, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateShort } from "@/lib/format";
import { updateMyMeasurements } from "@/lib/actions/self-service";

const FIELDS = [
  ["height_display", "Height", "5'10\""],
  ["bust", "Bust", "82"],
  ["waist", "Waist", "61"],
  ["hips", "Hips", "89"],
  ["shoe_uk", "Shoes (UK)", "7"],
  ["dress_size", "Dress size", "UK 8"],
  ["hair_colour", "Hair", "Dark brown"],
  ["eye_colour", "Eyes", "Brown"],
];

const inputClass =
  "h-8 w-full rounded-lg border border-input bg-surface px-2.5 text-[13px] text-foreground transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] placeholder:text-muted-foreground/40 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-ring";

// Talent-editable measurements. Saves through updateMyMeasurements — RLS
// restricts the write to the caller's own card.
export function MeasurementsCard({ measurements }) {
  const m = measurements ?? {};
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const result = await updateMyMeasurements(prev, formData);
    if (result?.success) setEditing(false);
    return result;
  }, undefined);

  const rows = FIELDS.map(([key, label]) => ({ key, label, value: m[key] })).filter(
    (r) => r.value
  );

  return (
    <section>
      <div className="flex items-baseline justify-between border-b border-border pb-2.5">
        <h2 className="text-[13px] font-medium text-foreground">Measurements</h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="pressable inline-flex items-center gap-1 text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
          >
            <PenLine className="h-3 w-3" />
            Update
          </button>
        )}
      </div>

      {editing ? (
        <form action={action} className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {FIELDS.map(([key, label, placeholder]) => (
              <label key={key} className="block">
                <span className="text-[11.5px] text-muted-foreground">{label}</span>
                <input
                  name={key}
                  defaultValue={m[key] ?? ""}
                  placeholder={placeholder}
                  maxLength={50}
                  className={cn(inputClass, "mt-1")}
                />
              </label>
            ))}
          </div>

          {state?.error && (
            <p className="inline-flex items-center gap-1.5 text-[12px] text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {state.error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="pressable inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="pressable inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
          <p className="text-[11.5px] text-muted-foreground/70">
            Your booking team sees updates instantly — castings use these numbers.
          </p>
        </form>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-[12.5px] text-muted-foreground">
          Nothing on file yet — add your measurements so castings can match you.
        </p>
      ) : (
        <>
          <dl className="divide-y divide-border/50">
            {rows.map((r) => (
              <div key={r.key} className="flex items-baseline justify-between py-2.5">
                <dt className="text-[12.5px] text-muted-foreground">{r.label}</dt>
                <dd className="text-[13.5px] font-medium text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
          {m.updated_at && (
            <p className="mt-3 text-[11.5px] text-muted-foreground/70">
              Last updated {dateShort(m.updated_at)}
            </p>
          )}
        </>
      )}
    </section>
  );
}
