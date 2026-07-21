import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listTalent } from "@/lib/queries/talent";
import { PageIntro, Stat } from "@/components/admin/kit";
import { TalentRoster } from "@/components/admin/roster";

export default async function TalentAdminPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  const talent = await listTalent({
    q: q || undefined,
    status: status || undefined,
    category: category || undefined,
  });

  const active = talent.filter((t) => t.status === "active").length;
  const inactive = talent.filter((t) => t.status !== "active").length;
  const publicCount = talent.filter((t) => t.is_public).length;
  const categories = new Set(talent.map((t) => t.category)).size;

  return (
    <div>
      <div className="flex items-end justify-between gap-4 pb-6">
        <PageIntro
          title="Talent roster"
          lede={`${talent.length} profiles across ${categories} categor${categories === 1 ? "y" : "ies"}.`}
        />
        <Link
          href="/admin/talent/new"
          className="pressable inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Add talent
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Matching" value={talent.length} />
        <Stat label="Active" value={active} accent="success" />
        <Stat label="Not active" value={inactive} />
        <Stat label="On public roster" value={publicCount} />
      </div>

      <div className="mt-8">
        <TalentRoster talent={talent} q={q} status={status} category={category} />
      </div>
    </div>
  );
}
