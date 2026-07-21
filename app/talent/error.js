"use client";

import { RotateCcw } from "lucide-react";

export default function TalentError({ error, reset }) {
  return (
    <div className="pt-20 text-center">
      <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-foreground">
        We couldn&rsquo;t load this page
      </h2>
      <p className="mx-auto mt-2 max-w-[46ch] text-[13px] leading-relaxed text-muted-foreground">
        {error?.message || "An unexpected error occurred."} If it keeps
        happening, email bookings@candormanagement.com.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="pressable mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}
