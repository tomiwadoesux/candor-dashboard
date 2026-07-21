import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listClients } from "@/lib/queries/clients";
import { PageIntro } from "@/components/admin/kit";
import { CastingNewForm } from "@/components/admin/casting-new-form";

const CATEGORIES = [
  "model",
  "photographer",
  "creative_director",
  "visual_artist",
  "artisan",
  "graphic_designer",
  "content_creator",
  "influencer",
  "brand_partner",
  "educator",
];
const LOCATIONS = ["lagos", "london", "usa_other"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function str(v) {
  return typeof v === "string" ? v : "";
}

function isoDate(v) {
  const s = str(v).slice(0, 10);
  return ISO_DATE.test(s) ? s : "";
}

// The deadline input is datetime-local; a bare date from a prefill link
// becomes end-of-business that day.
function deadlineLocal(v) {
  const s = str(v);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) return s.slice(0, 16);
  if (ISO_DATE.test(s)) return `${s}T17:00`;
  return "";
}

export default async function NewCastingPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const params = await searchParams;
  const clients = await listClients();

  // Prefill support (e.g. from the AI brief parser at /admin/tools/brief-parser).
  const defaults = {
    title: str(params.title),
    description: str(params.description),
    category: CATEGORIES.includes(params.category) ? params.category : "",
    location: LOCATIONS.includes(params.location) ? params.location : "",
    shootDateStart: isoDate(params.shootDateStart),
    shootDateEnd: isoDate(params.shootDateEnd),
    deadline: deadlineLocal(params.deadline),
    workType: str(params.workType),
    mediaUsage: str(params.mediaUsage),
    requirements: str(params.requirements),
    brandNameInternal: str(params.brandName),
  };

  return (
    <div>
      <Link
        href="/admin/casting"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
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
              Post a casting
            </>
          }
          lede="The public fields go straight to the talent board. The internal section — client and brand — is never shown to talent until selection."
        />
      </div>

      <div className="mt-10 max-w-3xl">
        <CastingNewForm
          clients={clients.map((c) => ({ id: c.id, name: c.company_name }))}
          defaults={defaults}
        />
      </div>
    </div>
  );
}
