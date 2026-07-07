import { communityFeed } from "@/lib/queries/community";
import { myMilestones } from "@/lib/queries/milestones";
import { myBookingsSplit } from "@/lib/queries/bookings";
import { dateShort, relativeTime } from "@/lib/format";
import { MilestonesFeed } from "@/components/talent/milestones/feed";
import { MilestoneSubmitForm } from "@/components/talent/milestones/submit-form";

export default async function MilestonesPage() {
  const [feed, mine, { past }] = await Promise.all([
    communityFeed(),
    myMilestones(),
    myBookingsSplit(),
  ]);

  const milestones = feed.filter((item) => item.kind === "milestone");
  const completedBookings = past.filter((b) => b.status === "completed");
  // Bookings already submitted don't need offering again.
  const submittedBookingIds = new Set(
    mine.map((m) => m.booking?.id).filter(Boolean)
  );
  const submittable = completedBookings.filter(
    (b) => !submittedBookingIds.has(b.id)
  );

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Community · Celebration wall
        </div>
        <div className="text-[11px] text-muted-foreground">
          {milestones.length} shared
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Milestones</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        Wins across the Candor roster. You decide whether your name appears.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MilestonesFeed milestones={milestones} />
        </div>

        <div className="lg:col-span-5">
          <section>
            <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
              <h3 className="font-serif text-[20px] font-light text-foreground">
                <span className="editorial-italic">Share a win</span>
              </h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                Reviewed by Candor
              </span>
            </div>
            <div className="mt-5">
              <MilestoneSubmitForm bookings={submittable} />
            </div>
          </section>

          <section className="mt-12">
            <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
              <h3 className="font-serif text-[20px] font-light text-foreground">
                <span className="editorial-italic">Your submissions</span>
              </h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                Newest first
              </span>
            </div>
            {mine.length === 0 ? (
              <p className="py-8 text-center text-[12.5px] italic text-muted-foreground">
                Nothing submitted yet — your first completed booking can go on
                the wall.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {mine.map((m) => (
                  <li key={m.id} className="py-4">
                    <p className="font-serif text-[15px] font-light leading-snug text-foreground">
                      {m.display_text}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[11px]">
                      {m.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-medium uppercase tracking-[0.1em] text-success">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 font-medium uppercase tracking-[0.1em] text-warning">
                          Awaiting approval
                        </span>
                      )}
                      <span className="rounded-full border border-border px-2 py-0.5 uppercase tracking-[0.1em] text-muted-foreground">
                        {m.visibility === "named" ? "Named" : "Anonymous"}
                      </span>
                      <span className="text-muted-foreground/80">
                        {relativeTime(m.created_at)}
                      </span>
                      {m.booking && (
                        <span className="truncate text-muted-foreground">
                          {m.booking.project_title} ·{" "}
                          {dateShort(m.booking.booking_date)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
