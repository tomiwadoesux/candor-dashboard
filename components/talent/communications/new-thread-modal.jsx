"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActions, useMe, useTeam } from "@/lib/store";

const SUBJECT_PRESETS = [
  "Availability & scheduling",
  "Change payout bank details",
  "Booking follow-up",
  "Wardrobe / fitting",
  "Personal — confidential",
  "Portfolio refresh",
  "Other",
];

export function NewThreadModal({ open, onClose, defaultTo, defaultSubject }) {
  const me = useMe();
  const team = useTeam();
  const { createThread, addNotification } = useActions();

  const [toId, setToId] = useState(defaultTo || team[0]?.id);
  const [subject, setSubject] = useState(defaultSubject || SUBJECT_PRESETS[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [body, setBody] = useState("");
  const [toPickerOpen, setToPickerOpen] = useState(false);
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setToId(defaultTo || team[0]?.id);
    setSubject(defaultSubject || SUBJECT_PRESETS[0]);
    setCustomSubject("");
    setBody("");
  }, [open, defaultTo, defaultSubject, team]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const toMember = useMemo(() => team.find((t) => t.id === toId), [team, toId]);

  if (!open) return null;

  const finalSubject = subject === "Other" ? customSubject.trim() : subject;

  function submit() {
    if (!me || !toMember || !finalSubject || !body.trim()) return;
    const now = new Date().toISOString();
    const threadId = `t-${Date.now()}`;
    const messageId = `m-${Date.now()}`;
    createThread({
      id: threadId,
      subject: finalSubject,
      talentId: me.id,
      createdById: me.id,
      createdByKind: "talent",
      toId: toMember.id,
      toKind: "admin",
      createdAt: now,
      lastAt: now,
      messages: [
        {
          id: messageId,
          authorId: me.id,
          authorKind: "talent",
          body: body.trim(),
          at: now,
          reactions: {},
        },
      ],
    });
    addNotification({
      id: `n-${Date.now()}`,
      title: `New thread started`,
      body: `${finalSubject} · to ${toMember.short}`,
      at: now,
      kind: "message",
      read: false,
    });
    onClose({ threadId });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      onClick={() => onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up-in relative flex w-[560px] max-w-[94vw] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-lift)]"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              New communication
            </div>
            <div className="font-serif text-[18px] italic text-foreground">
              Draft a message
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
              To
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setToPickerOpen((v) => !v);
                  setSubjectPickerOpen(false);
                }}
                className="flex h-10 w-full items-center gap-3 rounded-md border border-border bg-surface-muted/60 px-3 text-left transition-colors hover:border-border-strong"
              >
                {toMember && (
                  <>
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-background"
                      style={{ backgroundColor: toMember.accent || "#111" }}
                    >
                      {toMember.avatar}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {toMember.name}
                      <span className="ml-2 text-muted-foreground/70">
                        · {toMember.role}
                      </span>
                    </span>
                  </>
                )}
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>

              {toPickerOpen && (
                <ul className="absolute left-0 right-0 z-10 mt-1 max-h-[260px] overflow-y-auto rounded-md border border-border bg-background shadow-[var(--shadow-lift)]">
                  {team.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setToId(m.id);
                          setToPickerOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-muted",
                          m.id === toId && "bg-surface-muted"
                        )}
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-background"
                          style={{ backgroundColor: m.accent || "#111" }}
                        >
                          {m.avatar}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-medium text-foreground">
                            {m.name}
                          </div>
                          <div className="truncate text-[10.5px] text-muted-foreground">
                            {m.role}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
              Subject
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSubjectPickerOpen((v) => !v);
                  setToPickerOpen(false);
                }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface-muted/60 px-3 text-left transition-colors hover:border-border-strong"
              >
                <span className="truncate text-[13px] text-foreground">
                  {subject}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {subjectPickerOpen && (
                <ul className="absolute left-0 right-0 z-10 mt-1 max-h-[260px] overflow-y-auto rounded-md border border-border bg-background shadow-[var(--shadow-lift)]">
                  {SUBJECT_PRESETS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => {
                          setSubject(s);
                          setSubjectPickerOpen(false);
                        }}
                        className={cn(
                          "block w-full px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-surface-muted",
                          s === subject && "bg-surface-muted font-medium"
                        )}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {subject === "Other" && (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Write a subject…"
                className="mt-2 h-10 w-full rounded-md border border-border bg-surface-muted/60 px-3 text-[13px] text-foreground outline-none transition-colors focus:border-border-strong"
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Write your message…"
              className="w-full rounded-md border border-border bg-surface-muted/60 px-3 py-2.5 text-[13px] leading-relaxed text-foreground outline-none transition-colors focus:border-border-strong"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
          <div className="text-[11px] text-muted-foreground">
            Delivered to {toMember?.short || "—"} · thread opens in your inbox.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onClose()}
              className="h-9 rounded-md px-3 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!finalSubject || !body.trim()}
              onClick={submit}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-foreground px-4 text-[12.5px] font-medium text-background transition-colors hover:bg-foreground/92 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
