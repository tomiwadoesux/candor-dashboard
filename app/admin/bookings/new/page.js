import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listTalent } from "@/lib/queries/talent";
import { listClients } from "@/lib/queries/clients";
import { PageIntro } from "@/components/admin/kit";
import { BookingNewForm } from "@/components/admin/booking-new-form";

export default async function NewBookingPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const [talent, clients] = await Promise.all([listTalent(), listClients()]);

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to bookings
      </Link>

      <div className="mt-6">
        <PageIntro
          eyebrow="Operations · Bookings"
          meta="New record"
          title={
            <>
              New booking
            </>
          }
          lede="Creates the booking, logs the first status entry, and notifies the talent for confirmation."
        />
      </div>

      <div className="mt-10 max-w-3xl">
        <BookingNewForm
          talent={talent.map((t) => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
            status: t.status,
          }))}
          clients={clients.map((c) => ({
            id: c.id,
            name: c.company_name,
            isActive: c.is_active,
          }))}
          initialTalentId={typeof sp.talentId === "string" ? sp.talentId : ""}
          initialClientId={typeof sp.clientId === "string" ? sp.clientId : ""}
          defaults={{
            projectTitle: typeof sp.projectTitle === "string" ? sp.projectTitle : "",
            bookingDate:
              typeof sp.bookingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.bookingDate)
                ? sp.bookingDate
                : "",
            feeCurrency: ["NGN", "GBP", "USD"].includes(sp.feeCurrency) ? sp.feeCurrency : "",
            talentFee:
              typeof sp.talentFee === "string" && Number(sp.talentFee) > 0 ? sp.talentFee : "",
            mediaUsage: typeof sp.mediaUsage === "string" ? sp.mediaUsage : "",
            notes: typeof sp.notes === "string" ? sp.notes : "",
          }}
        />
      </div>
    </div>
  );
}
