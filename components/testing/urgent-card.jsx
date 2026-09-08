"use client";

import { BellSimple, Check, ArrowBendUpLeft, X } from "@phosphor-icons/react";
import { initials } from "./roster";

/*
  URGENT — the agency needs an answer now, not a conversation.

  Sibling to the open call: same white surface, same rhythm, different
  accent. Deep ochre amber rather than a bright alert colour — it reads as
  caution next to the petrol and green without turning the page into a
  traffic light. Palette comes from --urgent on the page root.
*/

const AMBER = {
  "--u": "var(--urgent, oklch(0.52 0.105 62))",
  "--u-soft": "var(--urgent-soft, oklch(0.966 0.020 62))",
  "--u-line": "var(--urgent-line, oklch(0.895 0.040 62))",
};

export function UrgentCard({ urgent, onAcknowledge, onSeen, onDismiss, onReply, innerRadius }) {
  const radiusStyle = innerRadius != null ? (typeof innerRadius === "number" ? `${innerRadius}px` : innerRadius) : "var(--inner-radius, 16px)";
  const done = urgent.acknowledged;
  const seen = urgent.seen;

  return (
    <article
      style={{ ...AMBER, borderColor: "var(--u-line)", borderRadius: radiusStyle }}
      onClick={onSeen}
      title={seen ? undefined : "Click to mark as seen"}
      /* Seen means the shouting stops — not that it has been answered.
         The entrance animation has to go with it: its fill-mode pins
         opacity at 1 and would win over the class. */
      className={`border bg-surface p-4.5 transition-[opacity,box-shadow] duration-300 ease-[var(--ease-out)] ${
        seen
          ? "opacity-55 shadow-none"
          : "slide-up-in cursor-pointer shadow-[0_2px_12px_-2px_rgba(180,83,9,0.12)] hover:shadow-md"
      }`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center shrink-0 text-[var(--u)]">
            <BellSimple size={16} weight="fill" />
          </span>
          <span
            style={{ background: "var(--u)" }}
            className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.07em] text-white uppercase shrink-0"
          >
            Urgent
          </span>
          <span className="truncate text-[11.5px] font-medium text-foreground/80">
            {urgent.author} · {urgent.role}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
            {urgent.time}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground/50 transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X size={13} weight="bold" />
          </button>
        </div>
      </header>

      {urgent.title && (
        <p className="mt-2.5 text-[13px] font-bold text-foreground leading-snug">
          {urgent.title}
        </p>
      )}

      <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">
        {urgent.body}
      </p>

      <div
        style={{ background: "var(--u-soft)", borderColor: "var(--u-line)" }}
        className="mt-3 rounded-xl border border-[var(--u-line)]/60 px-3 py-2"
      >
        <p style={{ color: "var(--u)" }} className="text-[11px] font-medium leading-tight">
          Production is holding the call sheet on your answer.
        </p>
      </div>

      <div className="mt-3.5 flex items-center gap-2 pt-1 border-t border-border/40">
        {done ? (
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--u-line)] bg-[var(--u-soft)]/50 px-3 py-2 text-[11.5px] font-semibold text-[var(--u)]">
            <Check size={13} weight="bold" />
            <span>You confirmed at {urgent.acknowledgedAt || "Just now"}</span>
            <span className="ml-auto text-[11px] font-normal text-muted-foreground">
              {urgent.author?.split(" ")[0]} notified
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onAcknowledge?.(urgent.id)}
              style={{ background: "var(--u)" }}
              className="flex-1 rounded-xl py-2 text-[12px] font-semibold tracking-[0.01em] text-white shadow-xs transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110 active:scale-[0.98] text-center"
            >
              Confirm receipt
            </button>
            <button
              type="button"
              onClick={onReply}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition-colors duration-140 hover:border-border-strong hover:bg-surface-muted hover:text-foreground active:scale-[0.98]"
            >
              <ArrowBendUpLeft size={13} weight="bold" />
              <span>Reply</span>
            </button>
          </>
        )}
      </div>
    </article>
  );
}
