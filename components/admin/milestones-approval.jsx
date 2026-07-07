"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import {
  approveMilestone,
  rejectMilestone,
  editAndApproveMilestone,
} from "@/lib/actions/milestones";
import { dateShort, relativeTime } from "@/lib/format";
import { FormError, inputClass } from "@/components/admin/form-kit";

export function MilestonesApproval({ pending }) {
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [, startTransition] = useTransition();

  function run(id, fn, cleanup) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      else cleanup?.();
      setBusyId(null);
    });
  }

  return (
    <div>
      {error && <FormError error={error} />}
      <ul className="divide-y divide-border/60">
        {pending.map((m) => {
          const t = m.talent;
          const isEditing = editingId === m.id;
          const isRejecting = rejectingId === m.id;
          const busy = busyId === m.id;
          return (
            <li key={m.id} className="py-5">
              <div className="grid grid-cols-12 items-start gap-x-4">
                <div className="col-span-3">
                  <div className="text-[12.5px] text-foreground">
                    {t ? `${t.first_name} ${t.last_name}` : "Unknown talent"}
                  </div>
                  <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {m.visibility} · {relativeTime(m.created_at)}
                  </div>
                  {m.booking && (
                    <div className="mt-1 text-[10.5px] text-muted-foreground">
                      {m.booking.project_title}
                      {m.booking.client?.company_name
                        ? ` · ${m.booking.client.company_name}`
                        : ""}
                      {m.booking.booking_date
                        ? ` · ${dateShort(m.booking.booking_date)}`
                        : ""}
                    </div>
                  )}
                </div>

                <div className="col-span-6 min-w-0">
                  {isEditing ? (
                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      rows={2}
                      autoFocus
                      className={`${inputClass} resize-none font-serif text-[14px] italic`}
                    />
                  ) : (
                    <blockquote className="border-l border-border/60 pl-4 font-serif text-[15px] font-light italic leading-relaxed text-foreground">
                      &ldquo;{m.display_text}&rdquo;
                    </blockquote>
                  )}
                  {isRejecting && (
                    <div className="mt-3">
                      <input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Optional note to the talent — why it isn't going up"
                        autoFocus
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>

                <div className="col-span-3 flex flex-wrap items-center justify-end gap-1.5">
                  {isEditing ? (
                    <>
                      <ActionButton
                        primary
                        disabled={busy || !draftText.trim()}
                        onClick={() =>
                          run(
                            m.id,
                            () => editAndApproveMilestone(m.id, draftText.trim()),
                            () => setEditingId(null)
                          )
                        }
                      >
                        <Check className="h-3 w-3" />
                        {busy ? "Publishing…" : "Save & publish"}
                      </ActionButton>
                      <ActionButton disabled={busy} onClick={() => setEditingId(null)}>
                        <X className="h-3 w-3" />
                        Cancel
                      </ActionButton>
                    </>
                  ) : isRejecting ? (
                    <>
                      <ActionButton
                        destructive
                        disabled={busy}
                        onClick={() =>
                          run(
                            m.id,
                            () => rejectMilestone(m.id, rejectReason.trim()),
                            () => {
                              setRejectingId(null);
                              setRejectReason("");
                            }
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                        {busy ? "Removing…" : "Confirm reject"}
                      </ActionButton>
                      <ActionButton disabled={busy} onClick={() => setRejectingId(null)}>
                        Cancel
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton
                        primary
                        disabled={busy}
                        onClick={() => run(m.id, () => approveMilestone(m.id))}
                      >
                        <Check className="h-3 w-3" />
                        {busy ? "Publishing…" : "Approve"}
                      </ActionButton>
                      <ActionButton
                        disabled={busy}
                        onClick={() => {
                          setEditingId(m.id);
                          setDraftText(m.display_text || "");
                          setRejectingId(null);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </ActionButton>
                      <ActionButton
                        destructive
                        disabled={busy}
                        onClick={() => {
                          setRejectingId(m.id);
                          setEditingId(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </ActionButton>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ActionButton({ children, onClick, disabled, primary, destructive }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`pressable inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors disabled:opacity-60 ${
        primary
          ? "bg-foreground text-background"
          : destructive
            ? "border border-destructive/40 text-destructive hover:bg-destructive/5"
            : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
