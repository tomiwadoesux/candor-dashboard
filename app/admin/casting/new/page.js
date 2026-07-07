import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listClients } from "@/lib/queries/clients";
import { PageIntro } from "@/components/admin/kit";
import { CastingNewForm } from "@/components/admin/casting-new-form";

export default async function NewCastingPage() {
  await requireRole("booker", "md", "ceo");
  const clients = await listClients();

  return (
    <div>
      <Link
        href="/admin/casting"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to casting board
      </Link>

      <div className="mt-6">
        <PageIntro
          eyebrow="Operations · Casting"
          meta="New brief"
          title={
            <>
              Post a <span className="editorial-italic">casting</span>
            </>
          }
          lede="The public fields go straight to the talent board. The internal section — client and brand — is never shown to talent until selection."
        />
      </div>

      <div className="mt-10 max-w-3xl">
        <CastingNewForm
          clients={clients.map((c) => ({ id: c.id, name: c.company_name }))}
        />
      </div>
    </div>
  );
}
