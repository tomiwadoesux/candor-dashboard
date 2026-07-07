import { requireRole } from "@/lib/auth";
import { listDocuments } from "@/lib/queries/documents";
import { listTalent } from "@/lib/queries/talent";
import { PageIntro, Stat } from "@/components/admin/kit";
import { DocumentsVault } from "@/components/admin/documents-vault";

export default async function DocumentsAdminPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const talentId = typeof sp.talentId === "string" ? sp.talentId : "";
  const type = typeof sp.type === "string" ? sp.type : "";

  const [documents, talent] = await Promise.all([
    listDocuments({ talentId: talentId || undefined, type: type || undefined }),
    listTalent(),
  ]);

  const signed = documents.filter((d) => d.date_signed).length;
  const personalised = documents.filter((d) => d.is_personalised).length;
  const now = new Date();
  const recent = documents.filter(
    (d) => now - new Date(d.created_at) < 14 * 86400000
  ).length;

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Documents"
        meta={`${documents.length} on file`}
        title={<span className="editorial-italic">Vault</span>}
        lede="Agreements, deal memos, call sheets, statements and policy — everything the agency signs, sends, or files. File upload is coming; documents are linked by URL for now."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="In view" value={documents.length} sub="Current filters" />
        <Stat label="Signed" value={signed} sub="Date signed on record" accent="success" />
        <Stat label="Personalised" value={personalised} sub="Talent-specific" />
        <Stat label="New" value={recent} sub="Last 14 days" accent="bronze" />
      </div>

      <div className="mt-10">
        <DocumentsVault
          documents={documents}
          talent={talent.map((t) => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
          }))}
          talentId={talentId}
          type={type}
        />
      </div>
    </div>
  );
}
