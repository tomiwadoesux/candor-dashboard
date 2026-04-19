"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clock,
  Download,
  FileText,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

const ICONS = {
  Agreement: ShieldCheck,
  "Booking Confirmation": FileText,
  "Call Sheet": FileText,
  Financial: FileText,
  Policy: FileText,
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Agreement", label: "Agreements" },
  { id: "Booking Confirmation", label: "Deal memos" },
  { id: "Call Sheet", label: "Call sheets" },
  { id: "Policy", label: "Policies" },
  { id: "Financial", label: "Statements" },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DocumentLibrary({ documents }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const grouped = useMemo(() => {
    const sorted = [...documents].sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
    const filtered = sorted.filter((d) => {
      if (filter !== "all" && d.type !== filter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.fileName?.toLowerCase().includes(q)
      );
    });
    return filtered;
  }, [documents, filter, query]);

  const counts = useMemo(() => {
    const c = { all: documents.length };
    documents.forEach((d) => {
      c[d.type] = (c[d.type] || 0) + 1;
    });
    return c;
  }, [documents]);

  const open = grouped.find((d) => d.id === openId) || null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const count = counts[f.id];
            if (f.id !== "all" && !count) return null;
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
                  {count ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto relative flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground focus-within:border-foreground/50">
          <Search className="h-3 w-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
            className="w-40 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="mt-10 border-y border-border/60 py-10 text-center text-[13px] text-muted-foreground">
          No documents match.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
          {grouped.map((d, i) => {
            const Icon = ICONS[d.type] || FileText;
            const signed = !!d.dateSigned;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(d.id)}
                  className="group grid w-full grid-cols-12 items-start gap-x-6 gap-y-2 py-5 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="col-span-1 flex justify-start pl-1">
                    <span className="grid h-10 w-10 place-items-center rounded-sm border border-border/60 bg-card text-muted-foreground group-hover:text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="col-span-11 min-w-0 md:col-span-7">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[9.5px] text-muted-foreground/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="truncate font-serif text-[20px] font-light leading-tight text-foreground">
                        {d.title}
                      </h3>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="uppercase tracking-[0.12em]">{d.type}</span>
                      <span>·</span>
                      <span className="font-mono text-[10.5px] text-muted-foreground/70">
                        {d.fileName}
                      </span>
                      {!d.isPersonalised && (
                        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                          Shared
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                      Uploaded
                    </div>
                    <div className="mt-0.5 text-[12px] text-foreground">
                      {fmtDate(d.uploadedAt)}
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    {signed ? (
                      <>
                        <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                          Signed
                        </div>
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-emerald-700 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                          {fmtDate(d.dateSigned)}
                        </div>
                      </>
                    ) : d.type === "Booking Confirmation" ? (
                      <>
                        <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                          Status
                        </div>
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-amber-700 dark:text-amber-400">
                          <Clock className="h-3 w-3" />
                          Awaiting signature
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                          Reference
                        </div>
                        <div className="mt-0.5 text-[12px] text-muted-foreground">
                          Read only
                        </div>
                      </>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && <DocumentDetail doc={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function DocumentDetail({ doc: d, onClose }) {
  const Icon = ICONS[d.type] || FileText;
  const signed = !!d.dateSigned;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card shadow-2xl"
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

        <div className="flex aspect-[5/6] items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-neutral-200 dark:from-stone-900 dark:via-stone-950 dark:to-neutral-900">
          <div className="relative flex h-[72%] w-[64%] flex-col rounded-sm bg-background shadow-[0_14px_40px_-12px_rgba(0,0,0,0.25)]">
            <div className="border-b border-border/50 p-4">
              <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/70">
                Candor Management Agency
              </div>
              <div className="mt-3 font-serif text-[14px] font-light italic leading-tight text-foreground">
                {d.title}
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-1.5">
                {[82, 96, 70, 88, 60, 78, 92, 54].map((w, i) => (
                  <div
                    key={i}
                    className="h-[3px] rounded-full bg-foreground/10"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 p-3 text-[7px] uppercase tracking-[0.2em] text-muted-foreground/60">
              Page 1 of 4
            </div>
          </div>
        </div>

        <div className="border-b border-border/60 p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-border/60 bg-muted/40">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </span>
            <div>
              <div className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {d.type}
              </div>
              <h3 className="font-serif text-[22px] font-light leading-snug text-foreground">
                {d.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          <DetailRow label="File">
            <span className="font-mono text-[11.5px]">{d.fileName}</span>
          </DetailRow>
          <DetailRow label="Uploaded">{fmtDate(d.uploadedAt)}</DetailRow>
          <DetailRow label="Signed">
            {signed ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Check className="h-3 w-3" /> {fmtDate(d.dateSigned)}
              </span>
            ) : (
              <span className="text-muted-foreground">Not signed</span>
            )}
          </DetailRow>
          <DetailRow label="Audience">
            {d.isPersonalised ? "Personal to you" : "Shared"}
          </DetailRow>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 p-4">
          <span className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Managed by Candor · view only
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
          >
            <Download className="h-3 w-3" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-[12.5px] text-foreground">{children}</div>
    </div>
  );
}
