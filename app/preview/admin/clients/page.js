import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat } from "@/components/admin/kit";
import { ClientsList } from "@/components/admin/clients-list";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const clients = preview.clients;
  const established = clients.filter((c) => c.client_type === "established").length;
  const active = clients.filter((c) => c.is_active).length;
  const totalBookings = clients.reduce((s, c) => s + (c.bookingCount ?? 0), 0);

  return (
    <AdminFrame>
      <PageIntro title="Clients" meta={`${clients.length} on file`} lede="Brands and agencies Candor books talent for." />
      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="On file" value={clients.length} sub={`${established} established`} />
        <Stat label="Active" value={active} sub="Open for bookings" accent="success" />
        <Stat label="New clients" value={clients.length - established} />
        <Stat label="Lifetime bookings" value={totalBookings} sub="Across the roster" />
      </div>
      <div className="mt-8">
        <ClientsList clients={clients} />
      </div>
    </AdminFrame>
  );
}
