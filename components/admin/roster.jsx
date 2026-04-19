"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Active", label: "Active" },
  { id: "Onboarding", label: "Onboarding" },
  { id: "Inactive", label: "Inactive" },
];

export function TalentRoster({ talent, onboardingSteps }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: talent.length };
    talent.forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
    });
    return c;
  }, [talent]);

  const filtered = useMemo(() => {
    return talent.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.stageName.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q)
      );
    });
  }, [talent, filter, query]);

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
            placeholder="Search roster"
            className="w-40 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {filtered.map((t, i) => (
          <li key={t.id}>
            <Link
              href={`/admin/talent/${t.id}`}
              className="group grid grid-cols-12 items-center gap-x-4 gap-y-2 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                №{String(i + 1).padStart(3, "0")}
              </div>
              <div className="col-span-5 flex min-w-0 items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted/60 font-serif text-[15px] font-light italic text-foreground ring-1 ring-border/60">
                  {t.avatar}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-serif text-[18px] font-light text-foreground">
                      {t.stageName}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {t.name}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                    <span className="uppercase tracking-[0.1em]">{t.board}</span>
                    <span>·</span>
                    <span>{t.category}</span>
                    <span>·</span>
                    <span>{t.location}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                {t.status === "Onboarding" && onboardingSteps ? (
                  <div>
                    <div className="flex gap-0.5">
                      {onboardingSteps.map((s, idx) => (
                        <span
                          key={s}
                          className={`h-1 flex-1 rounded-full ${
                            idx < t.onboardingStep
                              ? "bg-foreground"
                              : "bg-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-[10.5px] text-muted-foreground">
                      Step {t.onboardingStep} · {onboardingSteps[t.onboardingStep - 1]}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground">
                    {t.bookings} booking{t.bookings === 1 ? "" : "s"} on file
                  </div>
                )}
              </div>
              <div className="col-span-2 text-right">
                <div className="font-serif text-[22px] font-light leading-none text-foreground">
                  {t.bookings}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  lifetime
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <StatusPill status={t.status} />
                <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            No talent match.
          </li>
        )}
      </ul>
    </>
  );
}

function StatusPill({ status }) {
  const tone =
    status === "Active"
      ? "text-emerald-700 dark:text-emerald-400"
      : status === "Onboarding"
      ? "text-amber-700 dark:text-amber-400"
      : "text-muted-foreground";
  const dot =
    status === "Active"
      ? "bg-emerald-500"
      : status === "Onboarding"
      ? "bg-amber-500"
      : "bg-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
