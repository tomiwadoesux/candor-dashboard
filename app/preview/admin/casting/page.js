import { Plus } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat } from "@/components/admin/kit";
import { CastingBoard } from "@/components/admin/casting-board";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const castings = preview.adminCastings;
  const open = castings.filter((c) => c.status === "open").length;
  const responses = castings.reduce((s, c) => s + (c.responsesCount ?? 0), 0);
  const interested = castings.reduce((s, c) => s + (c.interestedCount ?? 0), 0);

  return (
    <AdminFrame>
      <div className="flex items-end justify-between gap-4 pb-6">
        <PageIntro title="Casting board" meta={`${open} open`} lede="Briefs sent to the roster. Brand names stay internal." />
        <span className="pressable inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-medium text-brand-foreground">
          <Plus className="h-3.5 w-3.5" />
          Post a casting
        </span>
      </div>
      <div className="grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Open" value={open} accent="brand" />
        <Stat label="Total briefs" value={castings.length} />
        <Stat label="Responses" value={responses} />
        <Stat label="Interested" value={interested} accent="success" />
      </div>
      <div className="mt-8">
        <CastingBoard castings={castings} />
      </div>
    </AdminFrame>
  );
}
