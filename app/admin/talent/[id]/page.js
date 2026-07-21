import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole, FINANCE_ROLES } from "@/lib/auth";
import { getTalentById, getCastingAnalyticsForTalent } from "@/lib/queries/talent";
import { TalentDetail } from "@/components/admin/talent-detail";

export default async function TalentDetailPage({ params }) {
  const profile = await requireRole("booker", "md", "ceo");
  const { id } = await params;

  const talent = await getTalentById(id);
  if (!talent) notFound();

  const analytics = FINANCE_ROLES.includes(profile.role)
    ? await getCastingAnalyticsForTalent(id)
    : null;

  return (
    <div>
      <Link
        href="/admin/talent"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to roster
      </Link>

      <TalentDetail talent={talent} analytics={analytics} viewerRole={profile.role} />
    </div>
  );
}
