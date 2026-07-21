import { ArrowUpRight, Check, FileText, ShieldCheck, Wallet, BookOpen, CalendarCheck } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { dateShort, statusLabel } from "@/lib/format";
import { EmptyState, PageHeader, SectionHead, StatRow, StatTile } from "@/components/talent/kit";
import { TalentFrame } from "@/components/preview/talent-frame";

const GROUPS = [
  { key: "agreements", title: "Agreements", icon: ShieldCheck },
  { key: "bookings", title: "Bookings", icon: CalendarCheck },
  { key: "financial", title: "Financial", icon: Wallet },
  { key: "policies", title: "Policies", icon: BookOpen },
  { key: "other", title: "Other", icon: FileText },
];

export default function Page() {
  const groups = preview.docGroups;
  const all = GROUPS.flatMap((g) => groups[g.key] ?? []);
  const signedCount = all.filter((doc) => doc.date_signed).length;

  return (
    <TalentFrame>
      <PageHeader title="Documents" meta={`${all.length} on file`} />
      <StatRow className="md:grid-cols-3">
        <StatTile label="On file" value={all.length} />
        <StatTile label="Signed" value={signedCount} />
        <StatTile label="New this week" value={1} />
      </StatRow>

      {all.length === 0 ? (
        <EmptyState className="mt-10" title="No documents yet" sub="Your welcome agreement and booking paperwork will appear here." />
      ) : (
        GROUPS.map((g) => {
          const docs = groups[g.key] ?? [];
          if (docs.length === 0) return null;
          const Icon = g.icon;
          return (
            <section key={g.key} className="mt-10">
              <SectionHead title={g.title} meta={`${docs.length}`} className="border-b border-border pb-2.5" />
              <ul className="divide-y divide-border/60">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-4 py-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-[13.5px] font-medium text-foreground">{doc.title}</h4>
                        {!doc.is_personalised && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">Shared</span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
                        <span>{statusLabel(doc.document_type)}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>Added {dateShort(doc.created_at)}</span>
                        {doc.date_signed && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="inline-flex items-center gap-1 text-success"><Check className="h-3 w-3" />Signed {dateShort(doc.date_signed)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-foreground">
                      View
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </TalentFrame>
  );
}
