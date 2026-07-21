import { openCastingsForTalent } from "@/lib/queries/castings";
import { CastingBoard } from "@/components/talent/castings/board";
import { PageHeader } from "@/components/talent/kit";

export default async function CastingsPage() {
  const castings = await openCastingsForTalent();

  return (
    <div>
      <PageHeader
        title="Casting board"
        meta={`${castings.length} open · briefs stay anonymous until you're shortlisted`}
      />
      <CastingBoard castings={castings} />
    </div>
  );
}
