import { DocumentsVault } from "@/components/admin/documents-vault";
import { documents } from "@/lib/data";

const TODAY = new Date("2026-04-18T00:00:00");

export default function DocumentsAdminPage() {
  const total = documents.length;
  const agreements = documents.filter((d) => d.type === "Agreement").length;
  const dealMemos = documents.filter(
    (d) => d.type === "Booking Confirmation"
  ).length;
  const awaitingSignature = documents.filter(
    (d) => !d.dateSigned && d.type !== "Policy" && d.type !== "Call Sheet"
  ).length;
  const recent = documents.filter((d) => {
    const dt = new Date(`${d.uploadedAt}T00:00:00`);
    return TODAY - dt < 14 * 86400000;
  }).length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Documents
        </div>
        <div className="text-[11px] text-muted-foreground">
          {total} on file
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Vault</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Agreements, deal memos, call sheets, statements and policy —
        everything the agency signs, sends, or files. Pending signatures are
        surfaced up front.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-5">
        <Stat label="On file" value={total} sub="All documents" />
        <Stat label="Agreements" value={agreements} sub="Talent contracts" />
        <Stat label="Deal memos" value={dealMemos} sub="Booking paperwork" />
        <Stat
          label="Awaiting"
          value={awaitingSignature}
          sub="Need a signature"
          accent={awaitingSignature > 0 ? "amber" : null}
        />
        <Stat
          label="New"
          value={recent}
          sub="Uploaded · 14 days"
          accent="sky"
        />
      </div>

      <div className="mt-10">
        <DocumentsVault documents={documents} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "amber"
      ? "text-amber-700 dark:text-amber-400"
      : accent === "rose"
      ? "text-rose-700 dark:text-rose-400"
      : accent === "sky"
      ? "text-sky-700 dark:text-sky-400"
      : "text-foreground";
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        className={`mt-2 font-serif text-[28px] font-light leading-none tracking-[-0.02em] ${color}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
