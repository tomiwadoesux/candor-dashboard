// Shared primitives for talent pages. Server-safe (no hooks).

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

export function PageHeader({ title, meta, action, className }) {
  return (
    <div className={cn("flex items-end justify-between gap-4 pb-6 pt-2", className)}>
      <div>
        <h1 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {meta && <p className="mt-1 text-[12.5px] text-muted-foreground">{meta}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({ label, value, sub, tone }) {
  return (
    <div>
      <div className="text-[12px] font-medium text-muted-foreground">{label}</div>
      <div
        data-slot="numeric"
        className={cn(
          "mt-1.5 text-[20px] font-medium tracking-[-0.01em]",
          tone === "warn" ? "text-warning" : "text-foreground"
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 truncate text-[12px] text-muted-foreground/80">{sub}</div>
      )}
    </div>
  );
}

export function StatRow({ children, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-6 border-y border-border py-5 md:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHead({ title, href, linkLabel, meta, className }) {
  return (
    <div className={cn("flex items-baseline justify-between pb-3", className)}>
      <h2 className="text-[13px] font-medium text-foreground">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
        </Link>
      ) : meta ? (
        <span className="text-[12px] text-muted-foreground">{meta}</span>
      ) : null}
    </div>
  );
}

export function ToneChip({ status, tone, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium",
        tone.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {statusLabel(status)}
    </span>
  );
}

export function EmptyState({ title, sub, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-surface-muted/40 p-10 text-center",
        className
      )}
    >
      <p className="text-[14px] font-medium text-foreground">{title}</p>
      {sub && <p className="mt-1 text-[12.5px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
