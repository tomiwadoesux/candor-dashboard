"use client";

import Link from "next/link";
import { Printer, Repeat } from "lucide-react";

// Screen-only controls for the invoice studio — hidden entirely when printing.
export function InvoiceToolbar({ paymentId, isRemittance }) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="pressable inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
      >
        <Printer className="h-3 w-3" />
        Print / Save as PDF
      </button>
      <Link
        href={
          isRemittance
            ? `/admin/invoicing/${paymentId}/invoice`
            : `/admin/invoicing/${paymentId}/invoice?type=remittance`
        }
        className="pressable inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
      >
        <Repeat className="h-3 w-3" />
        {isRemittance ? "View client invoice" : "View talent remittance"}
      </Link>
    </div>
  );
}
