import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageIntro } from "@/components/admin/kit";
import { BriefParser } from "@/components/admin/tools/brief-parser";

export default async function BriefParserPage() {
  await requireRole("booker", "md", "ceo");

  return (
    <div>
      <Link
        href="/admin/tools"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to tools
      </Link>

      <div className="mt-6">
        <PageIntro
          eyebrow="Tools · AI"
          meta="Brief parser"
          title={
            <>
              Parse a <span className="editorial-italic">brief</span>
            </>
          }
          lede="Paste a client's messy email or WhatsApp brief. The AI extracts structured casting or booking fields you can review, edit, and turn into a record in one click."
        />
      </div>

      <div className="mt-10 max-w-3xl">
        <BriefParser />
      </div>
    </div>
  );
}
