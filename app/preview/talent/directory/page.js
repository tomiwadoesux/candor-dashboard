import Link from "next/link";
import { Search } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { statusLabel } from "@/lib/format";
import { DirectoryGrid } from "@/components/talent/directory/grid";
import { PageHeader } from "@/components/talent/kit";
import { TalentFrame } from "@/components/preview/talent-frame";

const CATEGORIES = ["model", "photographer", "creative_director", "visual_artist", "content_creator"];

function Chip({ active, children }) {
  return (
    <span
      className={`h-7 rounded-full px-3 text-[12px] font-medium leading-7 ${
        active ? "bg-foreground text-background" : "text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

export default function Page() {
  const roster = preview.publicRoster;
  return (
    <TalentFrame>
      <PageHeader title="Directory" meta={`${roster.length} represented`} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-input bg-surface px-3">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground/60">Search the roster…</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Chip active>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c}>{statusLabel(c)}</Chip>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <DirectoryGrid roster={roster} q="" />
      </div>
    </TalentFrame>
  );
}
