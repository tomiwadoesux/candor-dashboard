"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Search, X } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Active", label: "Active" },
  { id: "Pending", label: "Pending" },
];

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

export function ClientsList({ clients }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: clients.length };
    clients.forEach((cl) => {
      c[cl.status] = (c[cl.status] || 0) + 1;
    });
    return c;
  }, [clients]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q)
      );
    });
  }, [clients, filter, query]);

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
            placeholder="Search clients"
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
        {filtered.map((c, i) => {
          const outstanding = parseMoney(c.outstanding);
          return (
            <li key={c.id} className="py-5">
              <div className="grid grid-cols-12 items-start gap-x-4">
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  №{String(i + 1).padStart(3, "0")}
                </div>
                <div className="col-span-5 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="truncate font-serif text-[20px] font-light text-foreground">
                      {c.name}
                    </h3>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {c.clientType}
                    </span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-muted-foreground">
                    {c.contactPerson}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/80">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {c.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Type
                  </div>
                  <div className="mt-0.5 text-[12px] text-foreground">{c.type}</div>
                  <div className="mt-2 text-[10.5px] text-muted-foreground">
                    Terms · {c.paymentTerms}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Bookings
                  </div>
                  <div className="mt-0.5 font-serif text-[22px] font-light leading-none text-foreground">
                    {c.totalBookings}
                  </div>
                  <div className="mt-1 text-[10.5px] text-muted-foreground">
                    Since {c.joinDate}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Outstanding
                  </div>
                  <div
                    className={`mt-0.5 font-serif text-[17px] font-light ${
                      outstanding > 0
                        ? "text-rose-700 dark:text-rose-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {outstanding > 0 ? c.outstanding : "—"}
                  </div>
                  <div
                    className={`mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${
                      c.status === "Active"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"
                      }`}
                    />
                    {c.status}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            No clients match.
          </li>
        )}
      </ul>
    </>
  );
}
