import { MilestonesFeed } from "@/components/talent/milestones/feed";
import { milestones } from "@/lib/data";

export default function MilestonesPage() {
  const approvedCount = milestones.filter((m) => m.approved).length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Community · Celebration wall
        </div>
        <div className="text-[11px] text-muted-foreground">
          {approvedCount} shared this month
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Milestones</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        Wins across the Candor roster. You decide whether your name appears.
      </p>

      <div className="mt-10">
        <MilestonesFeed milestones={milestones} />
      </div>
    </div>
  );
}
