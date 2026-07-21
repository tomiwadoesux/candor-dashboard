import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageIntro } from "@/components/admin/kit";
import { TalentNewForm } from "@/components/admin/talent-new-form";

export default async function NewTalentPage() {
  await requireRole("booker", "md", "ceo");

  return (
    <div>
      <Link
        href="/admin/talent"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to roster
      </Link>

      <div className="mt-6">
        <PageIntro
          eyebrow="Operations · Roster"
          meta="New profile"
          title={
            <>
              Add talent
            </>
          }
          lede="Creates the profile and a login for the talent. They set their password via the forgot-password flow on first sign-in."
        />
      </div>

      <div className="mt-10 max-w-3xl">
        <TalentNewForm />
      </div>
    </div>
  );
}
