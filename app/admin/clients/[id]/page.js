import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getClientById } from "@/lib/queries/clients";
import { ClientDetail } from "@/components/admin/client-detail";

export default async function ClientDetailPage({ params }) {
  await requireRole("booker", "md", "ceo");
  const { id } = await params;

  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div>
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to clients
      </Link>

      <ClientDetail client={client} />
    </div>
  );
}
