import { Plus } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat } from "@/components/admin/kit";
import { TalentRoster } from "@/components/admin/roster";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const talent = preview.roster;
  const active = talent.filter((t) => t.status === "active").length;
  const inactive = talent.filter((t) => t.status !== "active").length;
  const publicCount = talent.filter((t) => t.is_public).length;
  const categories = new Set(talent.map((t) => t.category)).size;

  return (
    <AdminFrame>
      <div className="flex items-end justify-between gap-4 pb-6">
        <PageIntro title="Talent roster" lede={`${talent.length} profiles across ${categories} categories.`} />
        <span className="pressable inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-medium text-brand-foreground">
          <Plus className="h-3.5 w-3.5" />
          Add talent
        </span>
      </div>
      <div className="grid grid-cols-2 gap-6 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Matching" value={talent.length} />
        <Stat label="Active" value={active} accent="success" />
        <Stat label="Not active" value={inactive} />
        <Stat label="On public roster" value={publicCount} />
      </div>
      <div className="mt-8">
        <TalentRoster talent={talent} />
      </div>
    </AdminFrame>
  );
}
