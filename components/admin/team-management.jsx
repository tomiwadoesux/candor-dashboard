"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createAdminAccount, toggleAdminActive } from "@/lib/actions/team";
import { dateShort, statusLabel } from "@/lib/format";
import { StatusPill } from "@/components/admin/kit";
import {
  Field,
  FormError,
  FormSuccess,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

const ROLE_LABELS = {
  ceo: "Chief Executive",
  md: "Managing Director",
  booker: "Booker",
};

export function TeamManagement({ team, viewer }) {
  const [showForm, setShowForm] = useState(false);
  const [rowError, setRowError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [, startTransition] = useTransition();

  function handleToggle(member) {
    setRowError(null);
    setBusyId(member.id);
    startTransition(async () => {
      const result = await toggleAdminActive(member.id, !member.is_active);
      if (result?.error) setRowError(result.error);
      setBusyId(null);
    });
  }

  return (
    <section>
      <div className="flex items-baseline justify-between pb-3">
        <div className="text-[11.5px] font-medium text-muted-foreground/70">
          The team
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {team.length} account{team.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="pressable inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            {showForm ? "Close" : "Add account"}
          </button>
        </div>
      </div>

      {showForm && <CreateAccountForm viewerRole={viewer.role} />}

      {rowError && (
        <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          {rowError}
        </div>
      )}

      <ul className="divide-y divide-border/60 border-y border-border/60">
        {team.map((m, i) => (
          <li key={m.id} className="py-5">
            <div className="grid grid-cols-12 items-start gap-x-4">
              <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                №{String(i + 1).padStart(2, "0")}
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-muted/60 text-[12.5px] text-foreground ring-1 ring-border/60">
                  {(m.full_name || "?")
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-[13.5px] font-medium text-foreground">
                    {m.full_name}
                    {m.id === viewer.id && (
                      <span className="ml-2 text-[11.5px] font-medium text-muted-foreground">
                        You
                      </span>
                    )}
                  </h3>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {m.email}
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[11.5px] font-medium text-muted-foreground/70">
                  Role
                </div>
                <div className="mt-0.5 text-[12.5px] text-foreground">
                  {ROLE_LABELS[m.role] || statusLabel(m.role)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[11.5px] font-medium text-muted-foreground/70">
                  Since
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-foreground">
                  {dateShort(m.created_at)}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground/70">
                  Last login {m.last_login ? dateShort(m.last_login) : "never"}
                </div>
              </div>
              <div className="col-span-3 flex items-center justify-end gap-3">
                <StatusPill
                  status={m.is_active ? "active" : "inactive"}
                  accent={m.is_active ? "success" : "muted"}
                />
                {viewer.role === "ceo" && m.id !== viewer.id && (
                  <button
                    type="button"
                    disabled={busyId === m.id}
                    onClick={() => handleToggle(m)}
                    className="pressable inline-flex h-7 items-center rounded-full border border-border bg-card px-2.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-60"
                  >
                    {busyId === m.id
                      ? "Working…"
                      : m.is_active
                        ? "Deactivate"
                        : "Reactivate"}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
        {team.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            No team accounts yet — add the first one.
          </li>
        )}
      </ul>
    </section>
  );
}

function CreateAccountForm({ viewerRole }) {
  const formRef = useRef(null);
  const [state, action, pending] = useActionState(createAdminAccount, undefined);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="mb-6 space-y-4 rounded-sm border border-border/60 bg-muted/20 p-5"
    >
      <div className="text-[11.5px] font-medium text-muted-foreground/70">
        New team account · they set their password via the forgot-password flow
      </div>
      <FormError error={state?.error} />
      {state?.success && <FormSuccess>Account created — invite them to sign in.</FormSuccess>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Full name *">
          <input name="fullName" required className={inputClass} />
        </Field>
        <Field label="Email *">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field
          label="Role *"
          hint={viewerRole === "md" ? "MDs can only create bookers." : undefined}
        >
          <select name="role" required defaultValue="booker" className={inputClass}>
            <option value="booker">Booker</option>
            {viewerRole === "ceo" && <option value="md">Managing Director</option>}
          </select>
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton pending={pending}>
          {pending ? "Creating…" : "Create account"}
        </SubmitButton>
      </div>
    </form>
  );
}
