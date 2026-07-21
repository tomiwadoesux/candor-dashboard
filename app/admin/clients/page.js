import { requireRole } from "@/lib/auth";
import { listClients } from "@/lib/queries/clients";
import { PageIntro, Stat } from "@/components/admin/kit";
import { ClientsList } from "@/components/admin/clients-list";

export default async function ClientsAdminPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const type = typeof sp.type === "string" ? sp.type : "";

  const clients = await listClients({ q: q || undefined, type: type || undefined });

  const active = clients.filter((c) => c.is_active).length;
  const established = clients.filter((c) => c.client_type === "established").length;
  const totalBookings = clients.reduce((s, c) => s + (c.bookingsCount || 0), 0);

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Clients"
        meta={`${clients.length} on file`}
        title="Clients"
        lede="Everyone who books Candor talent — brands, fashion houses, editorial desks. Contact details and payment terms in one view."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="On file" value={clients.length} sub={`${established} established`} />
        <Stat label="Active" value={active} sub="Open for bookings" accent="success" />
        <Stat
          label="New clients"
          value={clients.length - established}
          sub="100% upfront terms"
          accent="brand"
        />
        <Stat label="Lifetime bookings" value={totalBookings} sub="Across the roster" />
      </div>

      <div className="mt-10">
        <ClientsList clients={clients} q={q} type={type} />
      </div>
    </div>
  );
}
