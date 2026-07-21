import { communityFeed } from "@/lib/queries/community";
import { myMilestones } from "@/lib/queries/milestones";
import { myBookingsSplit } from "@/lib/queries/bookings";
import { dateShort, relativeTime } from "@/lib/format";
import { MilestonesFeed } from "@/components/talent/milestones/feed";
import { MilestoneSubmitForm } from "@/components/talent/milestones/submit-form";
import { PageHeader, SectionHead } from "@/components/talent/kit";

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
      <PageHeader
        title="Milestones"
        meta="Wins across the roster — your name appears only if you opt in"
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MilestonesFeed milestones={milestones} />
        </div>

        <div className="lg:col-span-5">
          <section>
            <SectionHead
              title="Share a win"
              meta="Reviewed by Candor"
              className="border-b border-border pb-2.5"
            />
            <div className="mt-4">
              <MilestoneSubmitForm bookings={submittable} />
            </div>
          </section>

          <section className="mt-10">
            <SectionHead
              title="Your submissions"
              className="border-b border-border pb-2.5"
            />
            {mine.length === 0 ? (
              <p className="py-8 text-center text-[12.5px] text-muted-foreground">
                Nothing submitted yet — your first completed booking can go on
                the wall.
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {mine.map((m) => (
                  <li key={m.id} className="py-3.5">
                    <p className="text-[13.5px] font-medium leading-snug text-foreground">
                      {m.display_text}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px]">
                      {m.is_published ? (
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning">
                          Awaiting approval
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {m.visibility === "named" ? "Named" : "Anonymous"}
                      </span>
                      <span className="text-muted-foreground/60">
                        {relativeTime(m.created_at)}
                      </span>
                      {m.booking && (
                        <span className="truncate text-muted-foreground/80">
                          {m.booking.project_title} · {dateShort(m.booking.booking_date)}
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
