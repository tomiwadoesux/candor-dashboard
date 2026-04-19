"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Search, X } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "escalated", label: "Escalated" },
  { id: "pending", label: "Awaiting" },
  { id: "closed", label: "Closed" },
];

const TYPE_LABELS = {
  availability_check: "Availability",
  booking_update: "Booking",
  payment_update: "Payment",
  portfolio_request: "Portfolio",
  pre_job_brief: "Brief",
  general: "General",
  announcement: "Announcement",
};

function fmtDateTime(s) {
  const d = new Date(s);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusOf(n) {
  const total = n.recipientIds.length;
  const responded = n.responses.length;
  if (n.escalated) return "escalated";
  if (responded < total) return "pending";
  return "closed";
}

export function CommunicationsLog({ notifications, talent }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const talentById = useMemo(() => {
    const m = {};
    talent.forEach((t) => {
      m[t.id] = t;
    });
    return m;
  }, [talent]);

  const counts = useMemo(() => {
    const c = { all: notifications.length, escalated: 0, pending: 0, closed: 0 };
    notifications.forEach((n) => {
      c[statusOf(n)] += 1;
    });
    return c;
  }, [notifications]);

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
      ),
    [notifications]
  );

  const filtered = useMemo(() => {
    return sorted.filter((n) => {
      if (filter !== "all" && statusOf(n) !== filter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.recipientNames.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [sorted, filter, query]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {f.label}
                <span
                  className={`font-mono text-[9.5px] ${
                    active ? "text-background/70" : "text-muted-foreground/60"
                  }`}
                >
                  {counts[f.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground focus-within:border-foreground/50">
          <Search className="h-3 w-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, recipients"
            className="w-56 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {filtered.map((n, i) => {
          const total = n.recipientIds.length;
          const responded = n.responses.length;
          const pct = Math.round((responded / total) * 100);
          const status = statusOf(n);
          const isOpen = openId === n.id;
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : n.id)}
                className="group relative grid w-full grid-cols-12 items-start gap-x-4 py-5 text-left transition-colors hover:bg-muted/30"
              >
                {n.escalated && (
                  <span className="absolute left-0 top-5 h-10 w-[2px] bg-rose-500" />
                )}
                <div className="col-span-1 pl-4 font-mono text-[10px] text-muted-foreground/60">
                  №{String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-6 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="truncate font-serif text-[18px] font-light text-foreground">
                      {n.title}
                    </h3>
                    {n.escalated && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.14em] text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="h-3 w-3" />
                        Escalated
                      </span>
                    )}
                  </div>
                  <div className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
                    {n.body}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-muted-foreground/80">
                    <span className="uppercase tracking-[0.1em]">
                      {TYPE_LABELS[n.type] || n.type}
                    </span>
                    <span>Sent · {fmtDateTime(n.sentAt)}</span>
                    <span>{n.sentBy}</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Responses
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1.5 font-serif text-[18px] font-light leading-none text-foreground">
                    {responded}
                    <span className="text-[11px] text-muted-foreground/70">
                      / {total}
                    </span>
                  </div>
                  <div className="mt-2 h-[2px] w-24 overflow-hidden bg-border/60">
                    <div
                      className={`h-full ${
                        pct === 100
                          ? "bg-emerald-500"
                          : n.escalated
                          ? "bg-rose-500"
                          : "bg-foreground/60"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Status
                  </div>
                  <div
                    className={`mt-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${
                      status === "closed"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : status === "escalated"
                        ? "text-rose-700 dark:text-rose-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        status === "closed"
                          ? "bg-emerald-500"
                          : status === "escalated"
                          ? "bg-rose-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    {status === "closed"
                      ? "Closed"
                      : status === "escalated"
                      ? "Escalated"
                      : "Awaiting"}
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="grid grid-cols-12 gap-x-4 px-2 pb-6">
                  <div className="col-span-1" />
                  <div className="col-span-11 space-y-4 rounded-sm bg-muted/30 p-5">
                    <p className="font-serif text-[15px] font-light leading-relaxed text-foreground">
                      {n.body}
                    </p>
                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                        Recipients
                      </div>
                      <ul className="mt-2 divide-y divide-border/40">
                        {n.recipientIds.map((rid, idx) => {
                          const t = talentById[rid];
                          const name = n.recipientNames[idx];
                          const response = n.responses.find(
                            (r) => r.talentId === rid
                          );
                          return (
                            <li
                              key={rid}
                              className="flex items-center gap-3 py-2"
                            >
                              <span className="grid h-7 w-7 place-items-center rounded-full bg-muted/60 font-serif text-[11px] font-light italic text-foreground ring-1 ring-border/60">
                                {t?.avatar || name.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="flex-1 text-[12.5px] text-foreground">
                                {name}
                              </span>
                              {response ? (
                                <>
                                  <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400">
                                    {response.response}
                                  </span>
                                  <span className="font-mono text-[9.5px] text-muted-foreground/60">
                                    {fmtDateTime(response.respondedAt)}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={`text-[10.5px] uppercase tracking-[0.14em] ${
                                    n.escalated
                                      ? "text-rose-700 dark:text-rose-400"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  No reply
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            Nothing on the wire.
          </li>
        )}
      </ul>
    </>
  );
}
