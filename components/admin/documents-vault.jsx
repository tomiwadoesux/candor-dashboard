// Server component — talent/type filters are searchParams-driven (GET form).

import { Check, Clock, FileText } from "lucide-react";
import { dateShort, statusLabel } from "@/lib/format";
import { EmptyRow } from "@/components/admin/kit";

const DOC_TYPES = [
  "management_agreement",
  "welcome_agreement",
  "nda",
  "code_of_conduct",
  "social_media_policy",
  "data_privacy_policy",
  "booking_confirmation",
  "call_sheet",
  "payment_statement",
  "other",
];

export function DocumentsVault({ documents, talent = [], talentId = "", type = "" }) {
  return (
    <>
      <form
        action="/admin/documents"
        className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"
      >
        <select
          name="talentId"
          defaultValue={talentId}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] text-foreground focus:border-foreground focus:outline-none"
        >
          <option value="">All talent</option>
          {talent.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] text-foreground focus:border-foreground focus:outline-none"
        >
          <option value="">All types</option>
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>
              {statusLabel(t)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="pressable inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          Apply
        </button>
      </form>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {documents.map((d) => (
          <li key={d.id} className="py-4">
            <div className="grid grid-cols-12 items-baseline gap-x-4">
              <div className="col-span-5 flex min-w-0 items-center gap-2.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[13.5px] font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    {d.title}
                  </a>
                  <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                    {d.talent ? `${d.talent.first_name} ${d.talent.last_name}` : "—"}
                    {d.booking?.project_title ? ` · ${d.booking.project_title}` : ""}
                  </div>
                </div>
              </div>
              <div className="col-span-3 text-[11.5px] font-medium text-muted-foreground">
                {statusLabel(d.document_type)}
                {d.is_personalised && (
                  <span className="ml-2 rounded-sm bg-brand/10 px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-brand">
                    Personalised
                  </span>
                )}
              </div>
              <div className="col-span-2 text-right font-mono text-[11px] text-muted-foreground">
                {dateShort(d.created_at)}
                {d.uploaded_by && (
                  <div className="mt-0.5 text-[9.5px] text-muted-foreground/70">
                    by {d.uploaded_by.full_name}
                  </div>
                )}
              </div>
              <div className="col-span-2 text-right">
                {d.date_signed ? (
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-success">
                    <Check className="h-3 w-3" /> Signed {dateShort(d.date_signed)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" /> Unsigned
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
        {documents.length === 0 && (
          <EmptyRow>
            No documents in this view — nothing has been filed yet.
          </EmptyRow>
        )}
      </ul>
    </>
  );
}
