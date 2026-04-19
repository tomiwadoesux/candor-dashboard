import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function TalentPlaceholder({ eyebrow, title, description, children }) {
  return (
    <div className="max-w-[1180px] pt-2">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {eyebrow}
      </div>
      <h2 className="mt-1.5 font-serif text-[34px] font-light tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">{title}</span>
      </h2>
      <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface-muted/40 p-12 text-center">
        <div className="mx-auto max-w-[36ch] space-y-2">
          <div className="font-serif text-[18px] italic text-foreground/90">
            Designing this now.
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            {children ||
              "The layout and data are specced — this page ships in the next pass."}
          </p>
        </div>
        <Link
          href="/talent/overview"
          className="mt-6 inline-flex items-center gap-1 border-b border-foreground/30 pb-0.5 text-[11.5px] font-medium text-foreground transition-colors hover:border-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to overview
        </Link>
      </div>
    </div>
  );
}
