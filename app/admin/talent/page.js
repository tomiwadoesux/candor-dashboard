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
      <PageIntro
        eyebrow="Operations · Roster"
        meta={`${categories} categor${categories === 1 ? "y" : "ies"} · ${talent.length} profiles`}
        title={
          <>
            <span className="editorial-italic">Talent</span> roster
          </>
        }
        lede="Every contracted face across the boards. Tap a name to open the full dossier — edits there reflect instantly on the talent's own dashboard."
      />

      <div className="mt-6 flex justify-end">
        <Link
          href="/admin/talent/new"
          className="pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-background"
        >
          <Plus className="h-3.5 w-3.5" />
          Add talent
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="Matching" value={talent.length} sub="Current view" />
        <Stat label="Active" value={active} sub="Currently working" accent="success" />
        <Stat label="Not active" value={inactive} sub="Inactive, suspended or exited" />
        <Stat label="On public roster" value={publicCount} sub="Marketing site" accent="bronze" />
      </div>

      <div className="mt-10">
        <TalentRoster talent={talent} q={q} status={status} category={category} />
      </div>
    </div>
  );
}
