import { TalentFrame } from "@/components/preview/talent-frame";
import { preview } from "@/lib/preview/mock";
import { CastingBoard } from "@/components/talent/castings/board";
import { PageHeader } from "@/components/talent/kit";

export default function Page() {
  const castings = preview.talentCastings;
  return (
    <TalentFrame>
      <PageHeader
        title="Casting board"
        meta={`${castings.length} open · briefs stay anonymous until you're shortlisted`}
      />
      <CastingBoard castings={castings} />
    </TalentFrame>
  );
}
