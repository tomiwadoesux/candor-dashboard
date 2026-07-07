// Small form primitives shared by the admin forms. No hooks — safe to import
// from client or server components.

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none";

export function Field({ label, children, hint, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="mt-1 text-[10.5px] text-muted-foreground/70">{hint}</div>}
    </label>
  );
}

export function FormError({ error }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
    >
      {error}
    </div>
  );
}

export function FormSuccess({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-[12px] text-success">
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
        "pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-background disabled:opacity-60",
        className
      )}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
