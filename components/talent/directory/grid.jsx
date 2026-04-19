"use client";

import { useMemo, useState } from "react";
import { Check, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ME_ID = "1";

const PALETTES = [
  ["from-primary/40", "via-chart-2/25", "to-chart-5/35"],
  ["from-chart-3/45", "via-chart-4/25", "to-primary/30"],
  ["from-chart-5/40", "via-chart-2/30", "to-chart-3/25"],
  ["from-chart-2/45", "via-primary/25", "to-chart-4/30"],
  ["from-chart-4/40", "via-chart-5/25", "to-chart-2/30"],
  ["from-primary/35", "via-chart-3/25", "to-chart-4/35"],
];

function paletteFor(id) {
  const n = Number(id) || id.charCodeAt?.(0) || 0;
  return PALETTES[n % PALETTES.length];
}

function XIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2H21.5l-7.47 8.534L22.5 22h-6.867l-5.38-7.03L3.9 22H.642l7.99-9.133L.5 2h7.045l4.868 6.428L18.244 2Zm-1.203 18h1.835L6.06 3.89H4.09L17.04 20Z" />
    </svg>
  );
}

function IgIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

const COLLAB_TYPES = [
  "Test shoot",
  "Portfolio collaboration",
  "Creative project",
  "Other",
];

export function DirectoryGrid({ talent }) {
  const augmented = useMemo(
    () =>
      talent.map((t) => ({
        ...t,
        displayName: `${t.stageName} ${t.name.split(" ")[1]?.[0] || ""}.`,
        twitter: `@${t.stageName.toLowerCase()}`,
      })),
    [talent]
  );

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [collab, setCollab] = useState(null);
  const [sent, setSent] = useState({});

  const locations = useMemo(() => {
    const set = new Set(augmented.map((t) => t.location));
    return ["all", ...Array.from(set)];
  }, [augmented]);

  const filtered = useMemo(() => {
    return augmented.filter((t) => {
      if (location !== "all" && t.location !== location) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !t.stageName.toLowerCase().includes(q) &&
          !t.name.toLowerCase().includes(q) &&
          !t.category.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [augmented, query, location]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 pb-8">
        <div className="relative flex h-9 flex-1 min-w-[220px] items-center gap-2 rounded-full border border-border bg-surface-muted px-3 transition-colors focus-within:border-border-strong focus-within:bg-surface">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the roster…"
            className="h-full flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {locations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-medium capitalize transition-colors",
                location === loc
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 py-16 text-center">
          <p className="font-serif text-[18px] italic text-muted-foreground">
            No one matches that.
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground/70">
            Try a different name or location.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => {
            const isMe = t.id === ME_ID;
            const hasSent = Boolean(sent[t.id]);
            const palette = paletteFor(t.id);
            const initials = t.stageName.slice(0, 1).toUpperCase();

            return (
              <li key={t.id} className="group flex flex-col items-center">
                <div
                  className="flex w-full max-w-[220px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg"
                >
                  <div
                    className={cn(
                      "relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-gradient-to-br",
                      ...palette
                    )}
                  >
                    <span className="font-serif text-[72px] font-light italic tracking-[-0.04em] text-foreground/30 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04] dark:mix-blend-screen">
                      {initials}
                    </span>
                    {isMe && (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-foreground px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-background">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex w-full items-center justify-between border-t border-border/40 px-3 py-2.5">
                    <span className="font-serif text-[13px] italic text-foreground/90">
                      {t.stageName}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                      {t.category}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex w-full flex-col items-center text-center">
                  <h3 className="font-serif text-[19px] font-light tracking-[-0.015em] text-foreground">
                    {t.displayName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{t.talent}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{t.category}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />
                      {t.location}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <a
                      href={`https://instagram.com/${t.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                    >
                      <IgIcon className="h-3 w-3" />
                      {t.instagram}
                    </a>
                    <a
                      href={`https://x.com/${t.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                    >
                      <XIcon className="h-2.5 w-2.5" />
                      {t.twitter}
                    </a>
                  </div>

                  {!isMe && (
                    <div className="mt-4">
                      {hasSent ? (
                        <span className="slide-up-in inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[11.5px] font-medium text-success">
                          <Check className="h-3 w-3" />
                          Request sent to Candor
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCollab(t)}
                          className="inline-flex h-8 items-center gap-1.5 border-b border-foreground/30 pb-0.5 text-[11.5px] font-medium text-foreground transition-colors hover:border-foreground"
                        >
                          Request collaboration
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {collab && (
        <CollabModal
          target={collab}
          onClose={() => setCollab(null)}
          onSubmit={() => {
            setSent((prev) => ({ ...prev, [collab.id]: true }));
            setCollab(null);
          }}
        />
      )}
    </div>
  );
}

function CollabModal({ target, onClose, onSubmit }) {
  const [type, setType] = useState(COLLAB_TYPES[0]);
  const [note, setNote] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/40 backdrop-blur-[6px]"
      />

      <div className="slide-up-in relative w-[min(520px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-20px_oklch(0_0_0/0.3)]">
        <div className="px-6 pt-6 pb-4">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
            Request collaboration
          </div>
          <h3 className="mt-1.5 font-serif text-[24px] font-light leading-[1.2] tracking-[-0.02em] text-foreground">
            <span className="editorial-italic">Collaborate</span> with {target.stageName}.
          </h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
            This goes to Candor — not directly to {target.stageName}. If it makes sense,
            your booker will facilitate the introduction.
          </p>
        </div>

        <form
          className="px-6 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ type, note });
          }}
        >
          <label className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            What kind of collaboration?
          </label>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {COLLAB_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex h-9 items-center justify-start rounded-full border px-3 text-[12px] font-medium transition-colors",
                  type === t
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                )}
              >
                {type === t && <Check className="mr-1.5 h-3 w-3" />}
                {t}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            Note <span className="lowercase text-muted-foreground/50">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="A line about what you have in mind…"
            className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-border-strong focus:outline-none"
          />

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[12.5px] font-medium text-background transition-transform hover:-translate-y-[1px]"
            >
              Send to Candor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
