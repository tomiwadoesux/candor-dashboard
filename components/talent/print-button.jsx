"use client";

import { Printer } from "lucide-react";

// Opens the browser print dialog — "Save as PDF" gives talent a clean
// statement for accountants. Print CSS lives in globals.css.
export function PrintButton({ label = "Export statement" }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="pressable no-print inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[12.5px] font-medium text-foreground transition-colors hover:border-border-strong"
    >
      <Printer className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
    </button>
  );
}
