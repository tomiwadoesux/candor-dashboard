// Small form primitives shared by the admin forms. No hooks — safe to import
// from client or server components.

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-9 w-full rounded-lg border border-input bg-surface px-3 text-[13px] text-foreground shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] placeholder:text-muted-foreground/50 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-ring";

export function Field({ label, children, hint, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[12.5px] font-medium text-foreground/90">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="mt-1.5 text-[12px] text-muted-foreground/80">{hint}</div>}
    </label>
  );
}

export function FormError({ error }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive"
    >
      {error}
    </div>
  );
}

export function FormSuccess({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-lg border border-success/25 bg-success/5 px-3 py-2 text-[12.5px] text-success">
      {children}
    </div>
  );
}

export function SubmitButton({ pending, children, className }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "pressable inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-60",
        className
      )}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
