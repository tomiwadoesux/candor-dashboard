import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listBookings } from "@/lib/queries/bookings";
import { PageIntro, Stat } from "@/components/admin/kit";
import { BookingsTable } from "@/components/admin/bookings-table";

export default async function BookingsAdminPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";

  const bookings = await listBookings({ status: status || undefined });

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const castingSent = bookings.filter((b) => b.status === "casting_sent").length;

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Bookings"
        meta={`${bookings.length} on record`}
        title={<span className="editorial-italic">Bookings</span>}
        lede="Every live, confirmed and pending job across the roster. Tap a row for deal terms, status history and payments."
      />

      <div className="mt-6 flex justify-end">
        <Link
          href="/admin/bookings/new"
          className="pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-background"
        >
          <Plus className="h-3.5 w-3.5" />
          New booking
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="Confirmed" value={confirmed} sub="Signed off" accent="success" />
        <Stat label="Pending" value={pending} sub="Awaiting confirmation" accent="warning" />
        <Stat label="Casting sent" value={castingSent} sub="Out to talent" accent="bronze" />
        <Stat label="Completed" value={completed} sub="Wrapped" />
      </div>

      <div className="mt-10">
        <BookingsTable bookings={bookings} status={status} />
      </div>
    </div>
  );
}
