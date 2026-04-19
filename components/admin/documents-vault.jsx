"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Search, X } from "lucide-react";

const TODAY = new Date("2026-04-18T00:00:00");

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Agreement", label: "Agreements" },
  { id: "Booking Confirmation", label: "Deal memos" },
  { id: "Call Sheet", label: "Call sheets" },
  { id: "Financial", label: "Financial" },
  { id: "Policy", label: "Policy" },
];

function parseDate(s) {
  return new Date(`${s}T00:00:00`);
}

function fmtDate(s) {
  if (!s) return "—";
  const d = parseDate(s);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`;
}

function isRecent(s) {
  const d = parseDate(s);
  return TODAY - d < 14 * 86400000;
}

const WIDTHS = [82, 96, 70, 88, 60, 78, 92, 54];

export function DocumentsVault({ documents }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const counts = useMemo(() => {
    const c = { all: documents.length };
    documents.forEach((d) => {
      c[d.type] = (c[d.type] || 0) + 1;
    });
    return c;
  }, [documents]);

  const filtered = useMemo(() => {
    return documents
      .filter((d) => {
        if (filter !== "all" && d.type !== filter) return false;
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.talentName?.toLowerCase().includes(q) ||
          d.fileName?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => parseDate(b.uploadedAt) - parseDate(a.uploadedAt));
  }, [documents, filter, query]);

  const open = filtered.find((d) => d.id === openId) || null;

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
            placeholder="Search documents"
            className="w-52 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
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
        {filtered.map((d, i) => {
          const signed = !!d.dateSigned;
          const fresh = isRecent(d.uploadedAt);
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setOpenId(d.id)}
                className="group grid w-full grid-cols-12 items-start gap-x-4 py-4 text-left transition-colors hover:bg-muted/30"
              >
                <div className="col-span-1 pl-2 font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(3, "0")}
                </div>
                <div className="col-span-6 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="truncate font-serif text-[17px] font-light text-foreground">
                      {d.title}
                    </h3>
                    {fresh && (
                      <span className="shrink-0 text-[9.5px] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-400">
                        New
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10.5px] text-muted-foreground/70">
                    {d.fileName}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {d.type}
                  </div>
                  <div className="mt-0.5 text-[12px] text-foreground">
                    {d.talentName || "—"}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Uploaded
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-foreground">
                    {fmtDate(d.uploadedAt)}
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  {signed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                      <Check className="h-3 w-3" /> Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-[12px] text-muted-foreground">
            No documents match.
          </li>
        )}
      </ul>

      {open && <DocumentPreview doc={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function DocumentPreview({ doc: d, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-border/60 p-6">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              {d.id.toUpperCase()}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {d.type}
            </span>
          </div>
          <h3 className="mt-2 font-serif text-[26px] font-light leading-tight text-foreground">
            {d.title}
          </h3>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {d.fileName}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className="mx-auto max-w-[440px] rounded-sm bg-background p-8 shadow-sm ring-1 ring-border/60">
            <div className="mb-6 border-b border-border/60 pb-4">
              <div className="font-serif text-[20px] font-light italic text-foreground">
                Candor
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
                Management · Lagos
              </div>
            </div>
            <div className="mb-5 font-serif text-[15px] font-light text-foreground">
              {d.title}
            </div>
            <div className="space-y-2">
              {WIDTHS.map((w, i) => (
                <div
                  key={i}
                  className="h-[6px] bg-muted-foreground/20"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
            <div className="mt-8 border-t border-border/60 pt-3 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">
              Page 1 · Preview
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-border/60 p-4 text-[11px]">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Uploaded
            </div>
            <div className="mt-0.5 text-foreground">{fmtDate(d.uploadedAt)}</div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Signed
            </div>
            <div className="mt-0.5 text-foreground">
              {d.dateSigned ? fmtDate(d.dateSigned) : "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Scope
            </div>
            <div className="mt-0.5 text-foreground">
              {d.isPersonalised ? "Personal" : "General"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
