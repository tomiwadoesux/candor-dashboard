import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat } from "@/components/admin/kit";
import { MilestonesApproval } from "@/components/admin/milestones-approval";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const pending = preview.pendingMilestones;
  const published = preview.publishedMilestones;
  const named = published.filter((m) => m.visibility === "named").length;

  return (
    <AdminFrame>
      <PageIntro title="Milestones & moments" meta={`${pending.length + published.length} on record`} lede="Wins talent submit. Approve to publish them to the community wall." />
      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Total" value={pending.length + published.length} sub="All drafts & posts" />
        <Stat label="Awaiting approval" value={pending.length} accent="warning" />
        <Stat label="Published" value={published.length} accent="success" />
        <Stat label="Named" value={named} sub="Opted in" />
      </div>
      <div className="mt-8">
        <MilestonesApproval pending={pending} />
      </div>
    </AdminFrame>
  );
}
