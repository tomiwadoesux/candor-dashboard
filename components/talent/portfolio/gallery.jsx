"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { dateShort, statusLabel } from "@/lib/format";

export function PortfolioGallery({ images, name }) {
  const [openId, setOpenId] = useState(null);
  const open = images.find((i) => i.id === openId) || null;

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
      <div className="stagger-in grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenId(img.id)}
            className="pressable group overflow-hidden rounded-sm border border-border/60 bg-card text-left transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={`${name} — ${statusLabel(img.image_type)}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {img.is_primary_polaroid && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-foreground px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-background">
                  Polaroid
                </span>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border/40 px-3 py-2.5">
              <span className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {statusLabel(img.image_type)}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/70">
                {dateShort(img.created_at)}
              </span>
            </div>
          </button>
        ))}
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
            <div className="min-h-0 flex-1 overflow-hidden bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={open.image_url}
                alt={`${name} — ${statusLabel(open.image_type)}`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="border-t border-border/60 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {statusLabel(open.image_type)}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  №{String(open.sort_order ?? 0).padStart(3, "0")}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Added {dateShort(open.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
