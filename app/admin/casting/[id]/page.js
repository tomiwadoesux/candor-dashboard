import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCastingById } from "@/lib/queries/castings";
import { CastingDetail } from "@/components/admin/casting-detail";

export default async function CastingDetailPage({ params }) {
  await requireRole("booker", "md", "ceo");
  const { id } = await params;

  const casting = await getCastingById(id);
  if (!casting) notFound();

  return (
    <div>
      <Link
        href="/admin/casting"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to casting board
      </Link>

      <CastingDetail casting={casting} />
    </div>
  );
}
