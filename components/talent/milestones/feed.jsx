// Server-rendered community milestone feed. Items come from
// communityFeed() filtered to kind === "milestone".
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";

export function MilestonesFeed({ milestones }) {
  return (
    <div>
      <ol className="stagger-in space-y-3">
        {milestones.map((m) => {
          const isNamed = m.visibility === "named" && m.talent;
          return (
            <li
              key={m.id}
              className="card-hover rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {isNamed && m.talent.polaroid_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.talent.polaroid_url}
                      alt={`${m.talent.first_name} ${m.talent.last_name}`}
                      className="h-11 w-11 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-full",
                        isNamed
                          ? "bg-brand-soft text-brand-soft-foreground"
                          : "bg-surface-muted text-muted-foreground/60"
                      )}
                    >
                      {isNamed ? (
                        <span className="text-[15px] font-medium">
                          {m.talent.first_name?.[0]}
                        </span>
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-medium leading-snug tracking-[-0.005em] text-foreground">
                    {m.displayText}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span>
                      {isNamed
                        ? `${m.talent.first_name} ${m.talent.last_name}`
                        : "Roster member"}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{relativeTime(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {milestones.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-surface-muted/40 py-14 text-center">
            <p className="text-[14px] font-medium text-foreground">Still quiet here</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Milestones appear as bookings land and talent opt in.
            </p>
          </li>
        )}
      </ol>
    </div>
  );
}
