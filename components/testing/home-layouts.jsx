"use client";

import { useState } from "react";

/*
  Three density options for the Home page, at wireframe fidelity.
  Same content everywhere — next job, bookings, earnings, open call —
  only the layout changes. Toggle to compare.
*/

const OPTIONS = [
  {
    id: "airy",
    label: "Airy",
    note: "3–4 large cards stacked with generous space. Calm and editorial; you scroll for the rest.",
  },
  {
    id: "balanced",
    label: "Balanced grid",
    note: "Hero next-job card, then a two-column grid of smaller tiles. Middle ground.",
  },
  {
    id: "dense",
    label: "Dense",
    note: "Everything visible at once in compact tiles — no scrolling, maximum glanceability.",
  },
];

function Box({ h, label, sub, grow = false, children }) {
  return (
    <div
      style={{ minHeight: h }}
      className={`flex flex-col rounded-xl border border-dashed border-border bg-surface px-4 py-3 ${grow ? "flex-1" : ""}`}
    >
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {sub ? <span className="mt-1 text-[11px] text-muted-foreground/70">{sub}</span> : null}
      {children}
    </div>
  );
}

function Airy() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
      <Box h={150} label="Next job — hero" sub="client · date · call time · location · bring list · fee" />
      <Box h={110} label="Upcoming bookings" sub="3 rows, one per job" />
      <Box h={90} label="Earnings" sub="cleared / pending" />
      <Box h={90} label="Open call" sub="claim button" />
      <p className="text-center text-[10.5px] text-muted-foreground/60">↓ scrolls</p>
    </div>
  );
}

function Balanced() {
  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
      <Box h={140} label="Next job — hero" sub="client · date · call · location · bring · fee" />
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Box h={190} label="Upcoming bookings" sub="3 rows + link to all" />
        <div className="flex flex-col gap-4">
          <Box h={88} label="Earnings" sub="cleared / pending" grow />
          <Box h={88} label="Open call" sub="claim button" grow />
        </div>
      </div>
    </div>
  );
}

function Dense() {
  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
        <Box h={110} label="Next job" sub="compact hero" />
        <Box h={110} label="Earnings" sub="2 numbers" />
        <Box h={110} label="Open call" sub="claim inline" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Box h={130} label="Upcoming bookings" sub="4 tight rows" />
        <Box h={130} label="Recent messages" sub="last 3, jump to inbox" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Box h={70} label="Milestones" />
        <Box h={70} label="Documents due" />
        <Box h={70} label="Casting invites" />
      </div>
      <p className="text-center text-[10.5px] text-muted-foreground/60">fits one screen</p>
    </div>
  );
}

const VIEWS = { airy: Airy, balanced: Balanced, dense: Dense };

export function HomeLayouts() {
  const [id, setId] = useState("balanced");
  const active = OPTIONS.find((o) => o.id === id);
  const View = VIEWS[id];

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 rounded-full bg-surface-muted p-0.5">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setId(o.id)}
                aria-pressed={o.id === id}
                className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                  o.id === id
                    ? "bg-surface text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
            Wireframe
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[11.5px] leading-relaxed text-muted-foreground">
          {active.note}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <View />
      </div>
    </div>
  );
}
