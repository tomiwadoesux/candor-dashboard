import { preview } from "@/lib/preview/mock";
import { PageIntro, Stat } from "@/components/admin/kit";
import { DocumentsVault } from "@/components/admin/documents-vault";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const documents = preview.documents;
  const signed = documents.filter((doc) => doc.date_signed).length;
  const personalised = documents.filter((doc) => doc.is_personalised).length;
  const talent = preview.roster.map((r) => ({ id: r.id, name: `${r.first_name} ${r.last_name}`, first_name: r.first_name, last_name: r.last_name }));

  return (
    <AdminFrame>
      <PageIntro title="Documents" meta={`${documents.length} on file`} lede="Every agreement, call sheet and statement across the roster." />
      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="In view" value={documents.length} sub="Current filters" />
        <Stat label="Signed" value={signed} sub="Date signed on record" accent="success" />
        <Stat label="Personalised" value={personalised} sub="Talent-specific" />
        <Stat label="New" value={2} sub="Last 14 days" accent="brand" />
      </div>
      <div className="mt-8">
        <DocumentsVault documents={documents} talent={talent} />
      </div>
    </AdminFrame>
  );
}
