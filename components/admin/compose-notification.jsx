"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
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

// Full compose panel — used by the messenger for new conversations and
// broadcasts. One recipient sends direct; several send a broadcast.
export function ComposeForm({ talent = [], onSent }) {
  const [type, setType] = useState("general");
  const formRef = useRef(null);
  const [state, action, pending] = useActionState(sendNotification, undefined);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onSent?.();
    }
  }, [state, onSent]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
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
              ? "Asks the talent for a response — escalates after 10 quiet hours."
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
        <Field label="Title">
          <input
            name="title"
            required
            className={inputClass}
            placeholder="Short and declarative"
          />
        </Field>
      </div>

      <Field label="Message">
        <textarea
          name="body"
          required
          rows={3}
          className={`${inputClass} h-auto resize-none py-2`}
          placeholder="What the talent reads in their inbox"
        />
      </Field>

      <Field label={`Recipients — one is direct, several is a broadcast`}>
        {talent.length === 0 ? (
          <p className="text-[12.5px] text-muted-foreground">
            No active talent to message yet.
          </p>
        ) : (
          <div className="grid max-h-52 grid-cols-1 gap-0.5 overflow-y-auto rounded-lg border border-border bg-surface p-2 sm:grid-cols-2 md:grid-cols-3">
            {talent.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-foreground transition-colors duration-140 hover:bg-surface-muted has-[:checked]:bg-brand-soft has-[:checked]:text-brand-soft-foreground"
              >
                <input
                  type="checkbox"
                  name="talentIds"
                  value={t.id}
                  className="accent-[#00749E]"
                />
                {t.name}
              </label>
            ))}
          </div>
        )}
      </Field>

      <div className="flex justify-end">
        <SubmitButton pending={pending}>
          {pending ? "Sending…" : "Send"}
        </SubmitButton>
      </div>
    </form>
  );
}
