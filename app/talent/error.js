"use client";

import { RotateCcw } from "lucide-react";

export default function TalentError({ error, reset }) {
  return (
    <div className="pt-16 text-center">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        Something went sideways
      </div>
      <h2 className="mt-2 font-serif text-[30px] font-light leading-tight tracking-[-0.02em] text-foreground">
        We couldn&rsquo;t load this <span className="editorial-italic">page</span>.
      </h2>
      <p className="mx-auto mt-2 max-w-[46ch] text-[13px] leading-relaxed text-muted-foreground">
        {error?.message || "An unexpected error occurred."} If it keeps
        happening, email bookings@ and we&rsquo;ll take a look.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="pressable mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-[12.5px] font-medium text-background"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}
