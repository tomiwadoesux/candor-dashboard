import { Plus } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat, moneyList } from "@/components/admin/kit";
import { BookingsTable } from "@/components/admin/bookings-table";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const bookings = preview.bookings;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending" || b.status === "casting_sent").length;
  const grossByCur = bookings.reduce((acc, b) => {
    acc[b.fee_currency] = (acc[b.fee_currency] ?? 0) + Number(b.total_client_fee ?? 0);
    return acc;
  }, {});

  return (
    <AdminFrame>
      <div className="flex items-end justify-between gap-4 pb-6">
        <PageIntro title="Bookings" meta={`${bookings.length} on the board`} lede="Every job across the roster, newest first." />
        <span className="pressable inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-medium text-brand-foreground">
          <Plus className="h-3.5 w-3.5" />
          New booking
        </span>
      </div>
      <div className="grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Total" value={bookings.length} />
        <Stat label="Confirmed" value={confirmed} accent="success" />
        <Stat label="In motion" value={pending} accent="warning" />
        <Stat label="Client value" value={moneyList(grossByCur, "—")} />
      </div>
      <div className="mt-8">
        <BookingsTable bookings={bookings} />
      </div>
    </AdminFrame>
  );
}
