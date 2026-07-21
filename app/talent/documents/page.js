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
import {
  EmptyState,
  PageHeader,
  SectionHead,
  StatRow,
  StatTile,
} from "@/components/talent/kit";

const GROUPS = [
  { key: "agreements", title: "Agreements", icon: ShieldCheck },
  { key: "bookings", title: "Bookings", icon: CalendarCheck },
  { key: "financial", title: "Financial", icon: Wallet },
  { key: "policies", title: "Policies", icon: BookOpen },
  { key: "other", title: "Other", icon: FileText },
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
      <PageHeader title="Documents" meta={`${all.length} on file`} />

      <StatRow className="md:grid-cols-3">
        <StatTile label="On file" value={all.length} />
        <StatTile label="Signed" value={signedCount} />
        <StatTile label="New this week" value={newCount} />
      </StatRow>

      {all.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="No documents yet"
          sub="Your welcome agreement and booking paperwork will appear here."
        />
      ) : (
        GROUPS.map((g) => {
          const docs = groups[g.key] ?? [];
          if (docs.length === 0) return null;
          const Icon = g.icon;
          return (
            <section key={g.key} className="mt-10">
              <SectionHead
                title={g.title}
                meta={`${docs.length}`}
                className="border-b border-border pb-2.5"
              />
              <ul className="divide-y divide-border/60">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center gap-4 py-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-[13.5px] font-medium text-foreground">
                          {d.title}
                        </h4>
                        {isNew(d.created_at) && (
                          <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-medium text-brand-soft-foreground">
                            New
                          </span>
                        )}
                        {!d.is_personalised && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                            Shared
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
                        <span>{statusLabel(d.document_type)}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>Added {dateShort(d.created_at)}</span>
                        {d.date_signed && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="inline-flex items-center gap-1 text-success">
                              <Check className="h-3 w-3" />
                              Signed {dateShort(d.date_signed)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-border-strong"
                    >
                      View
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      <p className="mt-10 text-[12px] leading-relaxed text-muted-foreground">
        Missing something? Email bookings@candormanagement.com for signed copies,
        historical statements or call sheets.
      </p>
    </div>
  );
}
