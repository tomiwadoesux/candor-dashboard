"use client";

import { RotateCcw } from "lucide-react";

export default function AdminError({ error, reset }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="text-[11.5px] font-medium text-muted-foreground/70">
        Something went wrong
      </div>
      <h1 className="mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
        We hit a snag
      </h1>
      <p className="mt-3 max-w-[48ch] text-[13px] leading-relaxed text-muted-foreground">
        {error?.message || "The page could not be loaded. Please try again."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="pressable mt-6 inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}
