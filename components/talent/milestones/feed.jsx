// Server-rendered community milestone feed. Items come from
// communityFeed() filtered to kind === "milestone".
import { Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";

export function MilestonesFeed({ milestones }) {
  return (
    <div>
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-surface-muted/60 px-4 py-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          When a booking wraps, you can share it here. Your name shows only if
          you say <em>yes, share my name</em>. No comments, no likes — just
          quiet wins.
        </p>
      </div>

      <ol className="relative">
        {milestones.map((m, i) => {
          const isNamed = m.visibility === "named" && m.talent;
          return (
            <li
              key={m.id}
              className={cn(
                "group relative py-8",
                i !== 0 && "border-t border-border"
              )}
            >
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  {isNamed ? (
                    <div className="polaroid flex h-[72px] w-[58px] rotate-[-4deg] items-center justify-center overflow-hidden transition-transform duration-300 group-hover:rotate-[-1deg] group-hover:scale-[1.03]">
                      {m.talent.polaroid_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.talent.polaroid_url}
                          alt={`${m.talent.first_name} ${m.talent.last_name}`}
                          className="absolute inset-1 bottom-6 rounded-[2px] object-cover"
                        />
                      ) : (
                        <>
                          <span className="absolute inset-1 bottom-6 rounded-[2px] bg-gradient-to-br from-bronze/30 via-bronze/15 to-muted" />
                          <span className="relative z-10 font-serif text-[14px] italic text-foreground/80">
                            {m.talent.first_name?.[0]}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-[72px] w-[58px] items-center justify-center rounded-md border border-dashed border-border bg-surface-muted">
                      <Sparkles className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="font-serif text-[22px] font-light leading-[1.25] tracking-[-0.015em] text-foreground">
                    {m.displayText}
                  </p>

                  <div className="mt-3 flex items-center gap-2.5 text-[11px]">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium uppercase tracking-[0.1em]",
                        isNamed
                          ? "bg-foreground text-background"
                          : "border border-border text-muted-foreground"
                      )}
                    >
                      {isNamed ? "Named" : "Anonymous"}
                    </span>
                    {isNamed && (
                      <span className="editorial-italic font-serif text-[13px] text-foreground/90">
                        {m.talent.first_name} {m.talent.last_name}
                      </span>
                    )}
                    <span className="text-muted-foreground/80">
                      {relativeTime(m.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {milestones.length === 0 && (
          <li className="py-16 text-center">
            <p className="font-serif text-[20px] italic text-muted-foreground">
              Still quiet here.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              New milestones appear as bookings land and talent opt in.
            </p>
          </li>
        )}
      </ol>

      <div className="mt-14 border-t border-border pt-6">
        <p className="font-serif text-[12px] italic text-muted-foreground">
          Candor Milestones · read-only · celebrating the roster
        </p>
      </div>
    </div>
  );
}
