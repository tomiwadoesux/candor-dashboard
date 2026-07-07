import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listCastings } from "@/lib/queries/castings";
import { PageIntro, Stat } from "@/components/admin/kit";
import { CastingBoard } from "@/components/admin/casting-board";

export default async function CastingAdminPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";

  const castings = await listCastings({ status: status || undefined });

  const open = castings.filter((c) => c.status === "open").length;
  const closed = castings.filter((c) => c.status !== "open").length;
  const totalResponses = castings.reduce((s, c) => s + (c.responsesCount || 0), 0);
  const totalInterested = castings.reduce((s, c) => s + (c.interestedCount || 0), 0);
  const now = new Date();
  const urgent = castings.filter((c) => {
    if (c.status !== "open") return false;
    const d = (new Date(c.deadline) - now) / 86400000;
    return d >= 0 && d <= 3;
  }).length;

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Casting"
        meta={`${castings.length} brief${castings.length === 1 ? "" : "s"} on the wall`}
        title={
          <>
            Casting <span className="editorial-italic">&amp; selection</span>
          </>
        }
        lede="Live briefs from clients — where interest becomes a shortlist, and a shortlist becomes a booking. Brand names stay internal until selection."
      />

      <div className="mt-6 flex justify-end">
        <Link
          href="/admin/casting/new"
          className="pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-background"
        >
          <Plus className="h-3.5 w-3.5" />
          Post a casting
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-5">
        <Stat label="Open" value={open} sub="Accepting interest" accent="success" />
        <Stat
          label="Closing soon"
          value={urgent}
          sub="Within 3 days"
          accent={urgent > 0 ? "destructive" : null}
        />
        <Stat label="Closed" value={closed} sub="Decision made" />
        <Stat label="Responses" value={totalResponses} sub="Across the board" />
        <Stat
          label="Interested"
          value={totalInterested}
          sub="Hands raised"
          accent={totalInterested > 0 ? "bronze" : null}
        />
      </div>

      <div className="mt-10">
        <CastingBoard castings={castings} status={status} />
      </div>
    </div>
  );
}
