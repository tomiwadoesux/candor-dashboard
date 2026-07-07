"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, PenLine, X } from "lucide-react";
import { sendNotification } from "@/lib/actions/notifications";
import { statusLabel } from "@/lib/format";
import {
  Field,
  FormError,
  FormSuccess,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

const TYPES = [
  "general",
  "availability_check",
  "booking_update",
  "portfolio_request",
  "payment_update",
  "pre_job_brief",
  "announcement",
];

const RESPONSE_TYPES = new Set([
  "availability_check",
  "booking_update",
  "portfolio_request",
  "pre_job_brief",
]);

export function ComposeNotification({ talent = [] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("general");
  const formRef = useRef(null);
  const [state, action, pending] = useActionState(sendNotification, undefined);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  if (!open) {
    return (
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h2 className="font-serif text-[22px] font-light text-foreground">
          <span className="editorial-italic">Compose</span>
        </h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-background"
        >
          <PenLine className="h-3.5 w-3.5" />
          New message
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-border/60 bg-muted/20 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          New message · one talent sends direct, several send a broadcast
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close composer"
          className="pressable grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <form ref={formRef} action={action} className="mt-4 space-y-4">
        <FormError error={state?.error} />
        {state?.success && (
          <FormSuccess>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Sent to {state.recipientCount} recipient
              {state.recipientCount === 1 ? "" : "s"}.
            </span>
          </FormSuccess>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Type"
            hint={
              RESPONSE_TYPES.has(type)
                ? "This type asks the talent for a response."
                : "FYI only — no response requested."
            }
          >
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputClass}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {statusLabel(t)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title *">
            <input name="title" required className={inputClass} placeholder="Short, declarative." />
          </Field>
        </div>

        <Field label="Body *">
          <textarea
            name="body"
            required
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="The talent reads this on their morning scroll."
          />
        </Field>

        <Field label={`Recipients * · ${talent.length} active talent`}>
          {talent.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">
              No active talent to message yet.
            </p>
          ) : (
            <div className="grid max-h-52 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-border bg-background p-3 sm:grid-cols-2 md:grid-cols-3">
              {talent.map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[12.5px] text-foreground transition-colors hover:bg-muted/50"
                >
                  <input type="checkbox" name="talentIds" value={t.id} />
                  {t.name}
                </label>
              ))}
            </div>
          )}
        </Field>

        <div className="flex justify-end">
          <SubmitButton pending={pending}>
            {pending ? "Sending…" : "Send to the wire"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
