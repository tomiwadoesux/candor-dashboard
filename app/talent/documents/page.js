import {
  ArrowUpRight,
  Check,
  FileText,
  ShieldCheck,
  Wallet,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import { myDocuments } from "@/lib/queries/documents";
import { dateShort, statusLabel } from "@/lib/format";

const GROUPS = [
  {
    key: "agreements",
    title: "Agreements",
    caption: "Management, NDAs, code of conduct",
    icon: ShieldCheck,
  },
  {
    key: "bookings",
    title: "Bookings",
    caption: "Confirmations and call sheets",
    icon: CalendarCheck,
  },
  {
    key: "financial",
    title: "Financial",
    caption: "Payment statements",
    icon: Wallet,
  },
  {
    key: "policies",
    title: "Policies",
    caption: "Social media and data privacy",
    icon: BookOpen,
  },
  {
    key: "other",
    title: "Other",
    caption: "Everything else on file",
    icon: FileText,
  },
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < SEVEN_DAYS_MS;
}

export default async function DocumentsPage() {
  const groups = await myDocuments();
  const all = GROUPS.flatMap((g) => groups[g.key] ?? []);
  const signedCount = all.filter((d) => d.date_signed).length;
  const newCount = all.filter((d) => isNew(d.created_at)).length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
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
        Your agreements, booking confirmations, call sheets and statements —
        uploaded and managed by Candor. Everything opens in a new tab.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <HeroStat label="On file" value={all.length} sub="Personal + shared" />
        <HeroStat label="Signed" value={signedCount} sub="Locked in the vault" />
        <HeroStat
          label="New this week"
          value={newCount}
          sub={newCount ? "Worth a look" : "Nothing new"}
        />
        <HeroStat
          label="Categories"
          value={GROUPS.filter((g) => (groups[g.key] ?? []).length > 0).length}
          sub="In your library"
        />
      </div>

      {all.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface-muted/40 p-12 text-center">
          <p className="font-serif text-[18px] italic text-foreground/90">
            No documents yet.
          </p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Your welcome agreement and booking paperwork will appear here.
          </p>
        </div>
      ) : (
        GROUPS.map((g) => {
          const docs = groups[g.key] ?? [];
          if (docs.length === 0) return null;
          const Icon = g.icon;
          return (
            <section key={g.key} className="mt-12">
              <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
                <h3 className="font-serif text-[22px] font-light text-foreground">
                  <span className="editorial-italic">{g.title}</span>
                </h3>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                  {g.caption}
                </span>
              </div>

              <ul className="divide-y divide-border/60 border-b border-border/60">
                {docs.map((d, i) => (
                  <li
                    key={d.id}
                    className="grid grid-cols-12 items-center gap-x-6 gap-y-2 py-5"
                  >
                    <div className="col-span-1 flex justify-start pl-1">
                      <span className="grid h-10 w-10 place-items-center rounded-sm border border-border/60 bg-card text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="col-span-11 min-w-0 md:col-span-6">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[9.5px] text-muted-foreground/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h4 className="truncate font-serif text-[19px] font-light leading-tight text-foreground">
                          {d.title}
                        </h4>
                        {isNew(d.created_at) && (
                          <span className="shrink-0 rounded-full bg-bronze/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-bronze">
                            New
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="uppercase tracking-[0.12em]">
                          {statusLabel(d.document_type)}
                        </span>
                        {!d.is_personalised && (
                          <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                        Added
                      </div>
                      <div className="mt-0.5 text-[12px] text-foreground">
                        {dateShort(d.created_at)}
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      {d.date_signed ? (
                        <>
                          <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                            Signed
                          </div>
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-success">
                            <Check className="h-3 w-3" />
                            {dateShort(d.date_signed)}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                            Reference
                          </div>
                          <div className="mt-0.5 text-[12px] text-muted-foreground">
                            Read only
                          </div>
                        </>
                      )}
                    </div>
                    <div className="col-span-3 flex justify-end md:col-span-1">
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="pressable inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-border-strong"
                      >
                        View
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      <div className="mt-14 rounded-sm border border-border/60 bg-muted/30 p-5">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Need something that isn&apos;t here?
        </div>
        <p className="mt-1.5 font-serif text-[14px] font-light italic leading-relaxed text-foreground">
          Email bookings@ — signed copies, historical statements, call sheets.
          We&apos;ll send it across.
        </p>
      </div>
    </div>
  );
}

function HeroStat({ label, value, sub }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div
        data-slot="numeric"
        className="mt-2 font-serif text-[30px] font-light tracking-[-0.02em] text-foreground"
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
