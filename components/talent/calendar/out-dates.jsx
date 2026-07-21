"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateShort } from "@/lib/format";
import { addOutDates, deleteOutDates } from "@/lib/actions/self-service";
import { SectionHead } from "@/components/talent/kit";

const inputClass =
  "h-9 w-full rounded-lg border border-input bg-surface px-3 text-[13px] text-foreground transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] placeholder:text-muted-foreground/50 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-ring";

function Entry({ entry, past }) {
  const [pending, startTransition] = useTransition();
  return (
    <li
      className={cn(
        "flex items-center gap-3 py-2.5",
        (past || pending) && "opacity-50"
      )}
    >
      <div className="min-w-0 flex-1">
        <div data-slot="numeric" className="text-[12.5px] font-medium text-foreground">
          {dateShort(entry.start_date)}
          {entry.end_date !== entry.start_date && ` – ${dateShort(entry.end_date)}`}
        </div>
        {entry.reason && (
          <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {entry.reason}
          </div>
        )}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteOutDates(entry.id))}
        aria-label="Remove out-dates"
        className="pressable grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground/60 transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </li>
  );
}

// Talent-declared "can't work" windows. Feeds the team's availability radar
// so nobody chases you while you're away.
export function OutDates({ entries }) {
  const [state, action, pending] = useActionState(addOutDates, undefined);
  const formRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <section>
      <SectionHead
        title="Out dates"
        meta="Visible to your booking team"
        className="border-b border-border pb-2.5"
      />

      <form ref={formRef} action={action} className="mt-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[11.5px] text-muted-foreground">From</span>
            <input type="date" name="start" required min={today} className={cn(inputClass, "mt-1")} />
          </label>
          <label className="block">
            <span className="text-[11.5px] text-muted-foreground">To</span>
            <input type="date" name="end" required min={today} className={cn(inputClass, "mt-1")} />
          </label>
        </div>
        <div className="flex gap-2">
          <input
            name="reason"
            maxLength={200}
            placeholder="Reason (optional) — travel, exams…"
            className={cn(inputClass, "flex-1")}
          />
          <button
            type="submit"
            disabled={pending}
            className="pressable inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-brand px-3 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            {pending ? "Saving…" : "Block"}
          </button>
        </div>
        {state?.error && (
          <p className="inline-flex items-center gap-1.5 text-[12px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {state.error}
          </p>
        )}
      </form>

      <ul className="mt-2 divide-y divide-border/50">
        {entries.length === 0 && (
          <li className="py-4 text-center text-[12px] text-muted-foreground">
            No blocked dates — you read as available.
          </li>
        )}
        {entries.map((e) => (
          <Entry key={e.id} entry={e} past={e.end_date < today} />
        ))}
      </ul>
    </section>
  );
}
