"use client";

import { Megaphone, Handshake, X, Users, Eye } from "@phosphor-icons/react";
import { ROSTER, byId, initials } from "./roster";

/*
  OPEN CALL — the one card in the feed that is not a message.

  An agent throws a spot at several people at once and the first to say yes
  takes it. Declining does not close the call; only a claim does, otherwise
  one person's "no" would kill an opportunity for everyone else.

  Same white surface as every other card; one dark green edge carries the
  signal. The rate sits in its own inset strip opposite the recipients —
  the two facts a model actually weighs before tapping.
*/

const GREEN = {
  "--call": "oklch(0.41 0.072 168)",
  "--call-soft": "oklch(0.958 0.020 168)",
  "--call-line": "oklch(0.90 0.030 168)",
};

function Face({ person, size = 30 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full border border-border bg-surface text-[10px] font-semibold text-foreground shadow-2xs"
    >
      {initials(person.name)}
    </span>
  );
}

/* Overlapped by default; fans out on hover, each face names itself. */
function AvatarStack({ people, max = 6 }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;

  return (
    <div className="group/stack flex items-center">
      {shown.map((person) => (
        <div
          key={person.id}
          className="group/av relative -ml-2.5 transition-[margin] duration-200 ease-[var(--ease-out)] first:ml-0 hover:z-10 group-hover/stack:ml-0.5 group-hover/stack:first:ml-0"
        >
          <Face person={person} />
          <span className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 scale-95 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-md transition-all duration-150 group-hover/av:scale-100 group-hover/av:opacity-100">
            {person.you ? "You" : person.name}
          </span>
        </div>
      ))}
      {rest > 0 ? (
        <span className="-ml-2.5 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-border bg-surface-muted text-[10px] font-semibold text-muted-foreground transition-[margin] duration-200 group-hover/stack:ml-0.5">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

export function OpenCallCard({ call, onRespond, innerRadius }) {
  const radiusStyle = innerRadius != null ? (typeof innerRadius === "number" ? `${innerRadius}px` : innerRadius) : "var(--inner-radius, 16px)";
  const filled = call.status === "claimed";
  const recipients =
    call.recipients === "everyone"
      ? ROSTER.filter((p) => !p.team) // an open call goes to talent, not staff
      : call.recipients.map((id) => byId[id]).filter(Boolean);

  const youDeclined = call.declined?.includes("zara");
  const seen = (call.seenBy ?? []).map((id) => byId[id]).filter(Boolean);

  // "Thu 14 Mar · 9am call · Shoreditch Studios · $2,400 day rate"
  const parts = call.detail.split(" · ");
  const rate = parts[parts.length - 1];
  const meta = parts.slice(0, -1).join("  ·  ");

  return (
    <article
      style={{ ...GREEN, borderRadius: radiusStyle }}
      className="border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-shadow duration-200 ease-[var(--ease-out)] hover:shadow-[var(--shadow-lift)]"
    >
      <header className="flex items-center gap-2">
        <span
          style={{ color: filled ? "var(--muted-foreground)" : "var(--call)" }}
          className="flex items-center justify-center shrink-0"
        >
          {filled ? <Handshake size={16} weight="fill" /> : <Megaphone size={16} weight="fill" />}
        </span>
        <span
          style={
            filled
              ? { background: "var(--call-soft)", color: "var(--call)" }
              : { background: "var(--call)", color: "white" }
          }
          className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.07em] uppercase shrink-0"
        >
          {filled ? "Filled" : "Open call"}
        </span>
        <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/70">
          {call.time}
        </span>
      </header>

      <p className="mt-3.5 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-foreground">
        {call.title}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">{meta}</p>

      {/* The two facts that decide it: what it pays, who's in the running */}
      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-surface-muted/60 px-4 py-3">
        <div className="leading-tight">
          <p className="font-mono text-[15px] font-semibold text-foreground">
            {rate.replace(/ (day rate|half day)$/, "")}
          </p>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">
            {rate.match(/(day rate|half day)$/)?.[0] ?? "rate"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {call.recipients === "everyone" ? (
            <div className="text-right leading-tight">
              <p className="flex items-center justify-end gap-1.5 text-[12px] font-semibold text-foreground">
                <Users size={13} weight="fill" />
                Everyone
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                {recipients.length} talent
              </p>
            </div>
          ) : (
            <>
              <div className="text-right leading-tight">
                <p className="text-[12px] font-semibold text-foreground">
                  {recipients.length} invited
                </p>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">hover for names</p>
              </div>
              <AvatarStack people={recipients} />
            </>
          )}
        </div>
      </div>

      {/* Read receipts matter most on a blast nobody is obliged to answer */}
      {call.recipients === "everyone" && seen.length ? (
        <div className="mt-3 flex items-center gap-2.5">
          <Eye size={13} className="shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-[11px] text-muted-foreground">
            Seen by {seen.length} of {recipients.length}
          </span>
          <AvatarStack people={seen} max={6} />
        </div>
      ) : null}

      {/* Two push answers, nothing to type */}
      <div className="mt-4">
        {filled ? (
          /* Who took it, in their own face — more use than a tick */
          <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted/60 px-3.5 py-2.5">
            <span
              style={{ background: "var(--call)" }}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
            >
              {initials(call.claimedBy === "You" ? "Zara Achebe" : call.claimedBy)}
            </span>
            <span className="text-[12px] text-foreground">
              <span className="font-semibold">{call.claimedBy}</span> took this spot
            </span>
            <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
              closed {call.claimedAt}
            </span>
          </div>
        ) : youDeclined ? (
          <div className="flex items-center gap-2 rounded-xl bg-surface-muted/60 px-4 py-2.5">
            <X size={14} weight="bold" className="text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">
              You passed — still open for the others.
            </span>
            <button
              type="button"
              onClick={() => onRespond(call.id, "undo")}
              className="ml-auto text-[12px] font-medium text-foreground underline-offset-2 hover:underline"
            >
              Undo
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onRespond(call.id, "available")}
              style={{ background: "var(--call)" }}
              className="flex-1 rounded-xl py-2.5 text-[12.5px] font-semibold tracking-[0.01em] text-white shadow-[var(--shadow-soft)] transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110 active:scale-[0.98]"
            >
              I&rsquo;m available
            </button>
            <button
              type="button"
              onClick={() => onRespond(call.id, "unavailable")}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors duration-140 hover:border-border-strong hover:bg-surface-muted hover:text-foreground active:scale-[0.98]"
            >
              Not available
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
