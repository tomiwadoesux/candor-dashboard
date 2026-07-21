import Image from "next/image";
import { requireRole } from "@/lib/auth";
import { pendingMilestones, publishedMilestones } from "@/lib/queries/milestones";
import { dateShort } from "@/lib/format";
import { PageIntro, Stat } from "@/components/admin/kit";
import { MilestonesApproval } from "@/components/admin/milestones-approval";

export default async function MilestonesAdminPage() {
  await requireRole("booker", "md", "ceo");
  const [pending, published] = await Promise.all([
    pendingMilestones(),
    publishedMilestones(),
  ]);

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Milestones"
        meta={`${pending.length + published.length} on record`}
        title={
          <>
            Milestones &amp; moments
          </>
        }
        lede="When a talent lands a job worth shouting about, a draft lands here. Approve it, tweak the copy, or keep it anonymous — then it goes live to the roster's feed."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-3">
        <Stat label="Total" value={pending.length + published.length} sub="All drafts & posts" />
        <Stat
          label="Awaiting review"
          value={pending.length}
          sub={pending.length > 0 ? "Queue up top" : "All caught up"}
          accent={pending.length > 0 ? "warning" : null}
        />
        <Stat label="Published" value={published.length} sub="Live on the feed" accent="success" />
      </div>

      {pending.length > 0 ? (
        <div className="mt-10 rounded-sm border border-warning/30 bg-warning/[0.04] p-5">
          <div className="flex items-baseline justify-between pb-3">
            <div>
              <div className="text-[11.5px] font-medium text-warning">
                Drafts to review
              </div>
              <p className="mt-1 max-w-[58ch] text-[11.5px] leading-relaxed text-muted-foreground">
                Talent submit milestone drafts from their bookings. Each sits here until
                an admin approves — then it publishes to the roster feed. Edit the copy,
                keep it named or anonymous, or turn it down with a note.
              </p>
            </div>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">
              {pending.length} awaiting you
            </span>
          </div>
          <MilestonesApproval pending={pending} />
        </div>
      ) : (
        <p className="mt-10 rounded-sm border border-border/60 bg-muted/20 p-5 text-[12.5px] text-muted-foreground">
          No drafts waiting — new submissions from talent land here for approval.
        </p>
      )}

      <div className="mt-12">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[11.5px] font-medium text-muted-foreground/70">
            Published
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {published.length} post{published.length === 1 ? "" : "s"}
          </span>
        </div>
        {published.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            Nothing published yet — approve a draft to light up the feed.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {published.map((m, i) => {
              const named = m.visibility === "named";
              const t = m.talent;
              return (
                <li key={m.id} className="py-5">
                  <div className="grid grid-cols-12 items-start gap-x-4">
                    <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                      №{String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="col-span-2">
                      {named && t ? (
                        <div className="flex items-center gap-2.5">
                          {t.polaroid_url ? (
                            <Image
                              src={t.polaroid_url}
                              alt=""
                              width={32}
                              height={32}
                              unoptimized
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-border/60"
                            />
                          ) : (
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-muted/60 text-[12.5px] text-foreground ring-1 ring-border/60">
                              {t.first_name?.[0]}
                              {t.last_name?.[0]}
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-[12.5px] text-foreground">
                              {t.first_name} {t.last_name}
                            </div>
                            <div className="font-mono text-[10.5px] text-muted-foreground/70">
                              Named
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-muted/60 text-[12px] font-medium text-muted-foreground ring-1 ring-border/60">
                            —
                          </span>
                          <div className="font-mono text-[10.5px] text-muted-foreground/70">
                            Anonymous
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-span-7 min-w-0">
                      <blockquote className="border-l border-border/60 pl-4 text-[13.5px] font-medium leading-relaxed text-foreground">
                        &ldquo;{m.display_text}&rdquo;
                      </blockquote>
                      {m.booking && (
                        <div className="mt-2 text-[10.5px] text-muted-foreground">
                          {m.booking.project_title}
                          {m.booking.client?.company_name
                            ? ` · ${m.booking.client.company_name}`
                            : ""}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-[11.5px] font-medium text-muted-foreground/70">
                        Published
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-foreground">
                        {dateShort(m.created_at)}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        Live
                      </div>
                      {m.approved_by && (
                        <div className="mt-1 text-[9.5px] text-muted-foreground/70">
                          by {m.approved_by.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
