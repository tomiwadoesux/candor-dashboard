"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, X, ArrowUpRight } from "lucide-react";

function InstagramGlyph({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function AgentCalloutModal({ open, onClose, agent }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !agent) return null;

  const instagramUrl = agent.instagram
    ? `https://instagram.com/${agent.instagram.replace(/^@/, "")}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up-in relative w-[420px] max-w-[92vw] overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-lift)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div
          className="h-[84px]"
          style={{
            background: `linear-gradient(135deg, ${agent.accent}22, ${agent.accent}08)`,
          }}
        />

        <div className="px-6 pb-6">
          <div className="-mt-8 flex items-end gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[16px] font-medium text-background shadow-[var(--shadow-lift)] ring-4 ring-background"
              style={{ backgroundColor: agent.accent || "#111" }}
            >
              {agent.avatar}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                Your agent
              </div>
              <div className="font-serif text-[22px] font-light italic leading-tight text-foreground">
                {agent.name}
              </div>
              <div className="text-[11.5px] text-muted-foreground">{agent.role}</div>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            <a
              href={`tel:${agent.phone?.replace(/\s+/g, "")}`}
              className="group flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-muted"
            >
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                  Phone
                </div>
                <div className="font-mono text-[13px] text-foreground">
                  {agent.phone}
                </div>
              </div>
              <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
            </a>

            <a
              href={`mailto:${agent.email}`}
              className="group flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-muted"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                  Email
                </div>
                <div className="truncate text-[13px] text-foreground">
                  {agent.email}
                </div>
              </div>
              <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
            </a>

            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-muted"
              >
                <InstagramGlyph className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                    Instagram
                  </div>
                  <div className="truncate text-[13px] text-foreground">
                    {agent.instagram}
                  </div>
                </div>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
              </a>
            )}
          </div>

          <Link
            href={`/talent/communications?to=${agent.id}`}
            onClick={onClose}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-[13px] font-medium text-background transition-colors hover:bg-foreground/92"
          >
            Reach {agent.short}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Opens a new thread in Communications.
          </p>
        </div>
      </div>
    </div>
  );
}
