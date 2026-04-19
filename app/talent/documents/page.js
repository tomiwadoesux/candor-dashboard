import { DocumentLibrary } from "@/components/talent/documents/library";
import { documents } from "@/lib/data";

const ME_ID = "1";

const EXTRA_DOCS = [
  {
    id: "d-zara-afropolitan",
    title: "Deal Memo — Afropolitan Editorial",
    type: "Booking Confirmation",
    talentId: ME_ID,
    talentName: "Zara",
    fileName: "deal_memo_afropolitan_may2026.pdf",
    uploadedAt: "2026-04-10",
    dateSigned: "2026-04-11",
    bookingId: "b-zara-3",
    isPersonalised: true,
  },
  {
    id: "d-zara-pepsi",
    title: "Deal Memo — Pepsi TVC (draft)",
    type: "Booking Confirmation",
    talentId: ME_ID,
    talentName: "Zara",
    fileName: "deal_memo_pepsi_may2026_draft.pdf",
    uploadedAt: "2026-04-17",
    dateSigned: null,
    bookingId: "b-zara-1",
    isPersonalised: true,
  },
  {
    id: "d-zara-q1",
    title: "Payment Statement — Q1 2026",
    type: "Financial",
    talentId: ME_ID,
    talentName: "Zara",
    fileName: "statement_zara_q1_2026.pdf",
    uploadedAt: "2026-04-02",
    dateSigned: null,
    bookingId: null,
    isPersonalised: true,
  },
  {
    id: "d-zara-nda",
    title: "NDA — Vlisco SS26 Campaign",
    type: "Agreement",
    talentId: ME_ID,
    talentName: "Zara",
    fileName: "nda_vlisco_ss26.pdf",
    uploadedAt: "2026-04-15",
    dateSigned: "2026-04-15",
    bookingId: "b-zara-2",
    isPersonalised: true,
  },
];

export default function DocumentsPage() {
  const mine = documents.filter(
    (d) => d.talentId === ME_ID || d.talentId === null
  );
  const all = [...mine, ...EXTRA_DOCS];

  const signedCount = all.filter((d) => d.dateSigned).length;
  const awaiting = all.filter(
    (d) => d.type === "Booking Confirmation" && !d.dateSigned
  ).length;
  const dealMemos = all.filter((d) => d.type === "Booking Confirmation").length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Documents
        </div>
        <div className="text-[11px] text-muted-foreground">
          {all.length} on file
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Documents</span>
      </h2>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
        Your management agreement, deal memos, call sheets and statements.
        Anything needing your signature is flagged — everything else is read only.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <HeroStat label="On file" value={all.length} sub="Personal + shared" />
        <HeroStat label="Signed" value={signedCount} sub="Locked in the vault" />
        <HeroStat
          label="Deal memos"
          value={dealMemos}
          sub="Across your bookings"
        />
        <HeroStat
          label="Awaiting you"
          value={awaiting}
          sub={awaiting === 0 ? "Nothing pending" : "Action in Communications"}
          tone={awaiting > 0 ? "warn" : null}
        />
      </div>

      <div className="mt-10">
        <DocumentLibrary documents={all} />
      </div>

      <div className="mt-14 rounded-sm border border-border/60 bg-muted/30 p-5">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Need something that isn&apos;t here?
        </div>
        <p className="mt-1.5 font-serif text-[14px] font-light italic leading-relaxed text-foreground">
          Ask Tomi in Communications — call sheets, signed copies, historical
          statements. We&apos;ll send it across.
        </p>
      </div>
    </div>
  );
}

function HeroStat({ label, value, sub, tone }) {
  const accent =
    tone === "warn"
      ? "text-rose-700 dark:text-rose-400"
      : "text-muted-foreground";
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-2 font-serif text-[30px] font-light tracking-[-0.02em] text-foreground">
        {value}
      </div>
      {sub && <div className={`mt-1 text-[11px] ${accent}`}>{sub}</div>}
    </div>
  );
}
