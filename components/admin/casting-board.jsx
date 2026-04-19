"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react";

const TODAY = new Date("2026-04-18T00:00:00");

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Open", label: "Open" },
  { id: "Closed", label: "Closed" },
];

function parseDate(d) {
  return new Date(`${d}T00:00:00`);
}

function daysUntil(d) {
  const diff = Math.round((parseDate(d) - TODAY) / 86400000);
  return diff;
}

function fmtDateRange(s) {
  if (!s) return "—";
  if (s.includes(" to ")) {
    const [a, b] = s.split(" to ");
    const ad = parseDate(a);
    const bd = parseDate(b);
    const sameMonth = ad.getMonth() === bd.getMonth();
    const month = ad.toLocaleString("en-GB", { month: "short" });
    if (sameMonth) return `${ad.getDate()}–${bd.getDate()} ${month}`;
    return `${ad.getDate()} ${month} – ${bd.getDate()} ${bd.toLocaleString(
      "en-GB",
      { month: "short" }
    )}`;
  }
  const d = parseDate(s);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`;
}

export function CastingBoard({ castings, talent }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const counts = useMemo(() => {
    const c = { all: castings.length };
    castings.forEach((k) => {
      c[k.status] = (c[k.status] || 0) + 1;
    });
    return c;
  }, [castings]);

  const filtered = useMemo(() => {
    const sorted = [...castings].sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    );
    if (filter === "all") return sorted;
    return sorted.filter((k) => k.status === filter);
  }, [castings, filter]);

  const talentById = useMemo(() => {
    const m = {};
    talent.forEach((t) => {
      m[t.id] = t;
    });
    return m;
  }, [talent]);

  return (
    <>
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

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {filtered.map((k, i) => {
          const daysToDeadline = daysUntil(k.deadline);
          const interestedCount = k.interests?.length || 0;
          const shortlistedCount = k.shortlisted?.length || 0;
          const selectedCount = k.selected?.length || 0;
          const isOpen = expanded === k.id;
          const urgent = daysToDeadline >= 0 && daysToDeadline <= 3 && k.status === "Open";

          return (
            <li key={k.id}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : k.id)}
                className="group grid w-full grid-cols-12 items-start gap-x-4 py-5 text-left transition-colors hover:bg-muted/30"
              >
                <div className="col-span-1 pl-2 font-mono text-[10px] text-muted-foreground/60">
                  №{String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-6 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="truncate font-serif text-[20px] font-light text-foreground">
                      {k.brandName}
                    </h3>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${
                        k.status === "Open"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          k.status === "Open"
                            ? "bg-emerald-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                      {k.status}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-[12px] text-muted-foreground">
                    {k.title}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/80">
                    <span className="uppercase tracking-[0.1em]">{k.workType}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {k.location}
                    </span>
                    <span>Shoot · {fmtDateRange(k.shootDates)}</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="grid grid-cols-3 gap-3">
                    <PipelineTile label="Interest" value={interestedCount} />
                    <PipelineTile label="Short" value={shortlistedCount} />
                    <PipelineTile
                      label="Picked"
                      value={selectedCount}
                      accent={selectedCount > 0 ? "emerald" : null}
                    />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Deadline
                  </div>
                  <div
                    className={`mt-0.5 font-serif text-[18px] font-light leading-none ${
                      urgent
                        ? "text-rose-700 dark:text-rose-400"
                        : "text-foreground"
                    }`}
                  >
                    {fmtDateRange(k.deadline)}
                  </div>
                  <div
                    className={`mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] ${
                      urgent
                        ? "text-rose-700 dark:text-rose-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {daysToDeadline >= 0
                      ? `${daysToDeadline}d to go`
                      : `${-daysToDeadline}d past`}
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="grid grid-cols-12 gap-x-4 px-2 pb-6">
                  <div className="col-span-1" />
                  <div className="col-span-11 space-y-4 rounded-sm bg-muted/30 p-5">
                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                        Brief
                      </div>
                      <p className="mt-1 font-serif text-[14.5px] font-light leading-relaxed text-foreground">
                        {k.description}
                      </p>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        Requirements · {k.requirements}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Usage · {k.mediaUsage}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <InterestColumn
                        title="Expressed interest"
                        members={k.interests || []}
                        talentById={talentById}
                      />
                      <InterestColumn
                        title="Shortlisted"
                        members={(k.shortlisted || []).map((id) => ({
                          talentId: id,
                          talentName: talentById[id]?.stageName || id,
                          status: "shortlisted",
                        }))}
                        talentById={talentById}
                        highlight
                      />
                      <InterestColumn
                        title="Selected"
                        members={(k.selected || []).map((id) => ({
                          talentId: id,
                          talentName: talentById[id]?.stageName || id,
                          status: "selected",
                        }))}
                        talentById={talentById}
                        success
                      />
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            No castings match.
          </li>
        )}
      </ul>
    </>
  );
}

function PipelineTile({ label, value, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-foreground";
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div className={`mt-0.5 font-serif text-[18px] font-light leading-none ${color}`}>
        {value}
      </div>
    </div>
  );
}

function InterestColumn({ title, members, talentById, highlight, success }) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-border/60 pb-1.5">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </span>
        <span className="font-mono text-[9.5px] text-muted-foreground/60">
          {members.length}
        </span>
      </div>
      {members.length === 0 ? (
        <p className="mt-3 text-[11.5px] italic text-muted-foreground">
          No one yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {members.map((m) => {
            const t = talentById[m.talentId];
            const name = t?.stageName || m.talentName;
            return (
              <li
                key={m.talentId + (m.status || "")}
                className="flex items-center gap-2.5"
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full font-serif text-[11px] font-light italic ring-1 ${
                    success
                      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/40 dark:text-emerald-400"
                      : highlight
                      ? "bg-foreground/5 text-foreground ring-border"
                      : "bg-muted/50 text-foreground ring-border/60"
                  }`}
                >
                  {t?.avatar || name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] text-foreground">
                    {name}
                  </div>
                  {m.status && m.status !== "shortlisted" && m.status !== "selected" && (
                    <div className="text-[10px] text-muted-foreground">
                      {m.hasConflict ? "Conflict flagged" : m.status.replace("_", " ")}
                    </div>
                  )}
                </div>
                {success && (
                  <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
