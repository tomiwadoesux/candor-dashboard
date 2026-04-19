"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PALETTES = [
  ["from-rose-200 via-rose-100 to-amber-100", "text-rose-900"],
  ["from-stone-200 via-stone-100 to-neutral-200", "text-stone-900"],
  ["from-amber-100 via-orange-100 to-rose-100", "text-amber-900"],
  ["from-emerald-100 via-teal-100 to-sky-100", "text-emerald-900"],
  ["from-violet-100 via-indigo-100 to-sky-100", "text-violet-900"],
  ["from-zinc-200 via-stone-100 to-amber-50", "text-zinc-900"],
];

const IMAGES = [
  { id: "p-01", type: "Editorial", caption: "Vanguard Magazine — Ceremonies issue", date: "2026-03-18", sort: 1 },
  { id: "p-02", type: "Comp card", caption: "Front — April 2026", date: "2026-04-02", sort: 2 },
  { id: "p-03", type: "Digital", caption: "Natural light, front", date: "2026-04-02", sort: 3 },
  { id: "p-04", type: "Digital", caption: "Natural light, 3/4", date: "2026-04-02", sort: 4 },
  { id: "p-05", type: "Digital", caption: "Natural light, back", date: "2026-04-02", sort: 5 },
  { id: "p-06", type: "Editorial", caption: "Ziva Lagos SS26 lookbook", date: "2026-02-22", sort: 6 },
  { id: "p-07", type: "Test shoot", caption: "Lagos Island — Maduka studio", date: "2026-01-15", sort: 7 },
  { id: "p-08", type: "Test shoot", caption: "Lagos Island — Maduka studio", date: "2026-01-15", sort: 8 },
  { id: "p-09", type: "Runway", caption: "Lagos Fashion Week — Orange Culture", date: "2025-10-27", sort: 9 },
  { id: "p-10", type: "Campaign", caption: "Maison Ire — holiday capsule", date: "2025-12-04", sort: 10 },
  { id: "p-11", type: "Polaroid", caption: "On-set, Ziva fitting", date: "2026-02-21", sort: 11 },
  { id: "p-12", type: "Editorial", caption: "Afropolitan — March cover story", date: "2026-03-02", sort: 12 },
];

function hash(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function paletteFor(id) {
  return PALETTES[hash(id) % PALETTES.length];
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PortfolioGallery() {
  const [openId, setOpenId] = useState(null);
  const open = IMAGES.find((i) => i.id === openId) || null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {IMAGES.sort((a, b) => a.sort - b.sort).map((img, i) => {
          const [grad, ink] = paletteFor(img.id);
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpenId(img.id)}
              className="group overflow-hidden rounded-sm border border-border/60 bg-card text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={`relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br ${grad} flex items-end p-4`}
              >
                <span className={`font-serif text-[72px] font-light italic leading-none ${ink} transition-transform duration-500 group-hover:scale-[1.04]`}>
                  Z
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="flex items-center justify-between border-t border-border/40 px-3 py-2.5">
                <span className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  {img.type}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/70">
                  {formatDate(img.date).split(" ").slice(1).join(" ")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative flex max-h-[88vh] w-full max-w-[520px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div
              className={`aspect-[3/4] w-full bg-gradient-to-br ${paletteFor(open.id)[0]} flex items-end p-10`}
            >
              <span
                className={`font-serif text-[180px] font-light italic leading-none ${paletteFor(open.id)[1]}`}
              >
                Z
              </span>
            </div>
            <div className="border-t border-border/60 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {open.type}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  №{String(open.sort).padStart(3, "0")}
                </span>
              </div>
              <p className="mt-2 font-serif text-[18px] font-light leading-snug text-foreground">
                {open.caption}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Captured {formatDate(open.date)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
