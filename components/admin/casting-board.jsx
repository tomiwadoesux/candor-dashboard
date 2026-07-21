"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Lock, MapPin, XCircle } from "lucide-react";
import { closeCasting } from "@/lib/actions/castings";
import { dateShort, relativeTime, statusLabel } from "@/lib/format";
import { StatusPill, EmptyRow } from "@/components/admin/kit";

const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "cancelled", label: "Cancelled" },
];

function castingAccent(status) {
  if (status === "open") return "success";
  if (status === "cancelled") return "destructive";
  return "muted";
}

export function CastingBoard({ castings, status = "" }) {
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  function handleClose(id, title) {
    if (!confirm(`Close "${title}"? It disappears from the talent board immediately.`)) return;
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await closeCasting(id);
      if (result?.error) setError(result.error);
      setPendingId(null);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.id;
          return (
            <Link
              key={f.id || "all"}
              href={f.id ? `/admin/casting?status=${f.id}` : "/admin/casting"}
              className={`pressable inline-flex items-center rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          {error}
        </div>
      )}

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {castings.map((c, i) => (
          <li key={c.id} className="group relative">
            <Link
              href={`/admin/casting/${c.id}`}
              className="grid grid-cols-12 items-start gap-x-4 py-5 transition-colors hover:bg-muted/30"
            >
              <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                №{String(i + 1).padStart(2, "0")}
              </div>
              <div className="col-span-5 min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-foreground">
                  {c.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="">
                    {statusLabel(c.category)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {statusLabel(c.location)}
                  </span>
                  {c.work_type && <span>{c.work_type}</span>}
                </div>
                {(c.brand_name_internal || c.client) && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-sm bg-warning/10 px-1.5 py-0.5 text-[11.5px] font-medium text-warning">
                    <Lock className="h-2.5 w-2.5" />
                    Internal · {c.brand_name_internal || c.client?.company_name}
                    {c.brand_name_internal && c.client
                      ? ` (${c.client.company_name})`
                      : ""}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <div className="text-[11.5px] font-medium text-muted-foreground/70">
                  Shoot
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-foreground">
                  {dateShort(c.shoot_date_start)}
                  {c.shoot_date_end ? ` – ${dateShort(c.shoot_date_end)}` : ""}
                </div>
                <div className="mt-1.5 text-[11.5px] font-medium text-muted-foreground/70">
                  Deadline
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-foreground">
                  {dateShort(c.deadline)}{" "}
                  <span className="text-muted-foreground/70">
                    ({relativeTime(c.deadline)})
                  </span>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <div className="text-[11.5px] font-medium text-muted-foreground/70">
                  Interest
                </div>
                <div
                  data-slot="numeric"
                  className="mt-0.5 text-[15px] font-semibold leading-none text-foreground"
                >
                  {c.interestedCount ?? 0}
                  <span className="text-[13px] text-muted-foreground">
                    /{c.responsesCount ?? 0}
                  </span>
                </div>
                <div className="mt-1 text-[10.5px] text-muted-foreground">responses</div>
              </div>
              <div className="col-span-2 flex items-start justify-end gap-2">
                <StatusPill status={c.status} accent={castingAccent(c.status)} />
                <ArrowUpRight className="mt-0.5 h-3 w-3 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
            </Link>
            {c.status === "open" && (
              <button
                type="button"
                disabled={pendingId === c.id}
                onClick={() => handleClose(c.id, c.title)}
                className="pressable absolute bottom-4 right-0 inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground opacity-0 transition-opacity hover:border-destructive/40 hover:text-destructive group-hover:opacity-100 disabled:opacity-60"
              >
                <XCircle className="h-3 w-3" />
                {pendingId === c.id ? "Closing…" : "Close"}
              </button>
            )}
          </li>
        ))}
        {castings.length === 0 && (
          <EmptyRow>
            No castings on the wall —{" "}
            <Link
              href="/admin/casting/new"
              className="underline transition-colors hover:text-foreground"
            >
              post the first brief
            </Link>
            .
          </EmptyRow>
        )}
      </ul>
    </>
  );
}
