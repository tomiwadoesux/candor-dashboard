"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

const TODAY = new Date("2026-04-18T00:00:00");

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Draft", label: "Draft" },
  { id: "Sent", label: "Sent" },
  { id: "Paid", label: "Paid" },
  { id: "Overdue", label: "Overdue" },
];

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(`${s}T00:00:00`);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`;
}

function statusTone(s) {
  switch (s) {
    case "Paid":
      return "text-emerald-700 dark:text-emerald-400";
    case "Overdue":
      return "text-rose-700 dark:text-rose-400";
    case "Sent":
      return "text-sky-700 dark:text-sky-400";
    default:
      return "text-muted-foreground";
  }
}

function statusDot(s) {
  switch (s) {
    case "Paid":
      return "bg-emerald-500";
    case "Overdue":
      return "bg-rose-500";
    case "Sent":
      return "bg-sky-500";
    default:
      return "bg-muted-foreground";
  }
}

function daysPastDue(s) {
  if (!s) return 0;
  const d = new Date(`${s}T00:00:00`);
  return Math.round((TODAY - d) / 86400000);
}

export function InvoiceRegister({ invoices }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: invoices.length };
    invoices.forEach((inv) => {
      c[inv.status] = (c[inv.status] || 0) + 1;
    });
    return c;
  }, [invoices]);

  const filtered = useMemo(() => {
    const sorted = [...invoices].sort((a, b) => {
      const order = { Overdue: 0, Sent: 1, Draft: 2, Paid: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });
    return sorted.filter((inv) => {
      if (filter !== "all" && inv.status !== filter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        inv.id.toLowerCase().includes(q) ||
        inv.client.toLowerCase().includes(q)
      );
    });
  }, [invoices, filter, query]);

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
            placeholder="Invoice № or client"
            className="w-44 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
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
        {filtered.map((inv) => {
          const overdue = inv.status === "Overdue";
          const past = overdue ? daysPastDue(inv.dueDate) : 0;
          return (
            <li key={inv.id}>
              <div className="relative grid grid-cols-12 items-start gap-x-4 py-5">
                {overdue && (
                  <span className="absolute left-0 top-5 h-10 w-[2px] bg-rose-500" />
                )}
                <div className="col-span-2 pl-4">
                  <div className="font-mono text-[11px] tracking-wider text-muted-foreground/80">
                    {inv.id}
                  </div>
                  <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/60">
                    {fmtDate(inv.issuedDate)}
                    {inv.dueDate && ` · due ${fmtDate(inv.dueDate)}`}
                  </div>
                </div>
                <div className="col-span-4 min-w-0">
                  <h3 className="truncate font-serif text-[19px] font-light text-foreground">
                    {inv.client}
                  </h3>
                  <div
                    className={`mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${statusTone(
                      inv.status
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusDot(inv.status)}`}
                    />
                    {inv.status}
                    {overdue && past > 0 && (
                      <span className="ml-1 font-mono text-[9.5px] text-rose-700/80 dark:text-rose-400/80">
                        {past}d past
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Gross
                  </div>
                  <div className="mt-0.5 font-serif text-[17px] font-light text-foreground">
                    {inv.amount}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Commission
                  </div>
                  <div className="mt-0.5 font-mono text-[13px] text-emerald-700 dark:text-emerald-400">
                    {inv.commission}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Talent pay
                  </div>
                  <div className="mt-0.5 font-mono text-[13px] text-foreground">
                    {inv.talentPay}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            No invoices match.
          </li>
        )}
      </ul>
    </>
  );
}
