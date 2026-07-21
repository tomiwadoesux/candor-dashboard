import { preview } from "@/lib/preview/mock";
import { dateShort, relativeTime } from "@/lib/format";
import { MilestonesFeed } from "@/components/talent/milestones/feed";
import { MilestoneSubmitForm } from "@/components/talent/milestones/submit-form";
import { PageHeader, SectionHead } from "@/components/talent/kit";
import { TalentFrame } from "@/components/preview/talent-frame";

export default function Page() {
  const milestones = preview.communityMilestones;
  const mine = preview.myMilestones;
  const submittable = preview.myBookings.past.filter((b) => b.status === "completed");

  return (
    <TalentFrame>
      <PageHeader title="Milestones" meta="Wins across the roster — your name appears only if you opt in" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MilestonesFeed milestones={milestones} />
        </div>
        <div className="lg:col-span-5">
          <section>
            <SectionHead title="Share a win" meta="Reviewed by Candor" className="border-b border-border pb-2.5" />
            <div className="mt-4">
              <MilestoneSubmitForm bookings={submittable} />
            </div>
          </section>
          <section className="mt-10">
            <SectionHead title="Your submissions" className="border-b border-border pb-2.5" />
            <ul className="divide-y divide-border/50">
              {mine.map((m) => (
                <li key={m.id} className="py-3.5">
                  <p className="text-[13.5px] font-medium leading-snug text-foreground">{m.display_text}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px]">
                    {m.is_published ? (
                      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">Published</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning">Awaiting approval</span>
                    )}
                    <span className="text-muted-foreground">{m.visibility === "named" ? "Named" : "Anonymous"}</span>
                    <span className="text-muted-foreground/60">{relativeTime(m.created_at)}</span>
                    {m.booking && (
                      <span className="truncate text-muted-foreground/80">
                        {m.booking.project_title} · {dateShort(m.booking.booking_date)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </TalentFrame>
  );
}
