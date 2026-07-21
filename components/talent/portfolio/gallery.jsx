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
      <div className="stagger-in grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenId(img.id)}
            className="card-hover group overflow-hidden rounded-xl border border-border bg-card text-left"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={`${name} — ${statusLabel(img.image_type)}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02]"
              />
              {img.is_primary_polaroid && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-background/85 px-2 py-0.5 text-[10.5px] font-medium text-foreground backdrop-blur-sm">
                  Polaroid
                </span>
              )}
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[11.5px] font-medium text-muted-foreground">
                {statusLabel(img.image_type)}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {dateShort(img.created_at)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm"
          onClick={() => setOpenId(null)}
        >
          <div
            className="slide-up-in relative flex max-h-[88vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
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
            <div className="flex items-baseline justify-between border-t border-border px-5 py-3.5">
              <span className="text-[12.5px] font-medium text-foreground">
                {statusLabel(open.image_type)}
              </span>
              <span className="text-[11.5px] text-muted-foreground">
                Added {dateShort(open.created_at)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
