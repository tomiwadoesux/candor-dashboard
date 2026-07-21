import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole, FINANCE_ROLES } from "@/lib/auth";
import { getBookingById } from "@/lib/queries/bookings";
import { BookingDetail } from "@/components/admin/booking-detail";

export default async function BookingDetailPage({ params }) {
  const profile = await requireRole("booker", "md", "ceo");
  const { id } = await params;

  const booking = await getBookingById(id);
  if (!booking) notFound();

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to bookings
      </Link>

      <BookingDetail
        booking={booking}
        canManagePayments={FINANCE_ROLES.includes(profile.role)}
      />
    </div>
  );
}
