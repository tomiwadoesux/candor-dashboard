// Shared editorial primitives for admin pages. Server-safe (no hooks) —
// usable from both server and client components.

import { money, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACCENTS = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  bronze: "text-bronze",
  muted: "text-muted-foreground",
};

export function accentText(accent) {
  return ACCENTS[accent] || "text-foreground";
}

export function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
      {children}
    </div>
  );
}

export function PageIntro({ eyebrow, meta, title, lede }) {
  return (
    <>
      <div className="flex items-baseline justify-between pb-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        {meta && <div className="text-[11px] text-muted-foreground">{meta}</div>}
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        {title}
      </h1>
      {lede && (
        <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
          {lede}
        </p>
      )}
    </>
  );
}

export function Stat({ label, value, sub, accent }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        data-slot="numeric"
        className={cn(
          "mt-2 font-serif text-[28px] font-light leading-none tracking-[-0.02em]",
          accentText(accent)
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

// booking_status → semantic accent
export function bookingAccent(status) {
  switch (status) {
    case "confirmed":
      return "success";
    case "completed":
      return "bronze";
    case "casting_sent":
      return "bronze";
    case "cancelled":
      return "destructive";
    default:
      return "muted"; // pending
  }
}

// payment_status → semantic accent
export function paymentAccent(status) {
  switch (status) {
    case "talent_paid":
      return "success";
    case "client_paid":
      return "bronze";
    case "awaiting_client_payment":
      return "warning";
    default:
      return "muted";
  }
}

const DOTS = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  bronze: "bg-bronze",
  muted: "bg-muted-foreground",
};

export function StatusPill({ status, accent, className }) {
  const a = accent || "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]",
        accentText(a),
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[a] || DOTS.muted)} />
      {statusLabel(status)}
    </span>
  );
}

// { NGN: 120000, GBP: 400 } → "₦120,000 · £400" (or fallback when empty)
export function moneyList(totals, fallback = "—") {
  const entries = Object.entries(totals || {}).filter(([, n]) => Number(n) !== 0);
  if (entries.length === 0) return fallback;
  return entries.map(([cur, n]) => money(n, cur)).join(" · ");
}

export function EmptyRow({ children, className }) {
  return (
    <li className={cn("py-10 text-center text-[12px] text-muted-foreground", className)}>
      {children}
    </li>
  );
}
