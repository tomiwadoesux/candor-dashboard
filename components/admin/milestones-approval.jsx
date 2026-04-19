"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

function fmtDateTime(s) {
  const d = new Date(s);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MilestonesApproval({ pending, talentById }) {
  const [handled, setHandled] = useState({});

  if (pending.length === 0) {
    return (
      <p className="text-[12px] italic text-muted-foreground">
        Queue is clear — nothing awaiting review.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/60 border-y border-border/60">
      {pending.map((m, i) => {
        const t = talentById[m.talentId];
        const state = handled[m.id];
        return (
          <li key={m.id} className="relative py-5">
            <span className="absolute left-0 top-5 h-12 w-[2px] bg-amber-500" />
            <div className="grid grid-cols-12 items-start gap-x-4 pl-4">
              <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                №{String(i + 1).padStart(2, "0")}
              </div>
              <div className="col-span-2 flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-muted/60 font-serif text-[12px] font-light italic text-foreground ring-1 ring-border/60">
                  {t?.avatar || m.talentName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] text-foreground">
                    {m.talentName}
                  </div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {m.visibility}
                  </div>
                </div>
              </div>
              <div className="col-span-6 min-w-0">
                <blockquote className="border-l border-border/60 pl-4 font-serif text-[15px] font-light italic leading-relaxed text-foreground">
                  &ldquo;{m.displayText}&rdquo;
                </blockquote>
                <div className="mt-2 text-[10.5px] text-muted-foreground">
                  {m.bookingTitle} · submitted {fmtDateTime(m.createdAt)}
                </div>
              </div>
              <div className="col-span-3 text-right">
                {state ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] ${
                      state === "approved"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {state === "approved" ? (
                      <>
                        <Check className="h-3 w-3" /> Approved
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" /> Rejected
                      </>
                    )}
                  </span>
                ) : (
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setHandled((s) => ({ ...s, [m.id]: "approved" }))
                      }
                      className="inline-flex items-center gap-1.5 border border-foreground bg-foreground px-3 py-1 text-[10.5px] uppercase tracking-[0.14em] text-background transition-colors hover:bg-foreground/85"
                    >
                      <Check className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHandled((s) => ({ ...s, [m.id]: "rejected" }))
                      }
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
