"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, Copy, Mail } from "lucide-react";
import { dateShort, money } from "@/lib/format";
import { EmptyRow } from "@/components/admin/kit";

// daysOverdue: positive = overdue (destructive), due within 3 days or today
// = warning, comfortably ahead of terms = muted.
function ageTone(daysOverdue) {
  if (daysOverdue > 0) return "text-destructive";
  if (daysOverdue >= -3) return "text-warning";
  return "text-muted-foreground";
}

function ageLabel(daysOverdue) {
  if (daysOverdue > 0) return `${daysOverdue}d overdue`;
  if (daysOverdue === 0) return "Due today";
  return `Due in ${-daysOverdue}d`;
}

export function ChaseTable({ rows }) {
  const [openId, setOpenId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const copyTimer = useRef(null);

  async function copyDraft(row) {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${row.reminder.subject}\n\n${row.reminder.body}`
      );
      setCopiedId(row.id);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard unavailable (permissions) — the textarea is still selectable.
    }
  }

  return (
    <ul className="divide-y divide-border/60 border-y border-border/60">
      {rows.map((row) => {
        const client = row.booking?.client;
        const open = openId === row.id;
        const mailto = client?.email && row.reminder
          ? `mailto:${client.email}?subject=${encodeURIComponent(row.reminder.subject)}&body=${encodeURIComponent(row.reminder.body)}`
          : null;

        return (
          <li key={row.id} className="py-4">
            <div className="grid grid-cols-12 items-baseline gap-x-4">
              <div className="col-span-3 min-w-0">
                <div className="truncate text-[13.5px] font-medium text-foreground">
                  {client?.company_name || "—"}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {client?.contact_person || client?.email || "No contact on file"}
                </div>
              </div>

              <div className="col-span-3 min-w-0">
                <Link
                  href={row.booking ? `/admin/bookings/${row.booking.id}` : "/admin/bookings"}
                  className="group inline-flex max-w-full items-baseline gap-1"
                >
                  <span className="truncate text-[12.5px] text-foreground group-hover:underline">
                    {row.booking?.project_title || "Booking"}
                  </span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                </Link>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {row.talent ? `${row.talent.first_name} ${row.talent.last_name}` : "—"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="font-mono text-[11px] text-muted-foreground/80">
                  {row.invoice_number || "No invoice №"}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                  Terms {client?.payment_terms || "Net 14"}
                </div>
              </div>

              <div className="col-span-2 text-right">
                <div
                  data-slot="numeric"
                  className="text-[13.5px] font-medium text-foreground"
                >
                  {money(row.gross_fee, row.currency)}
                </div>
              </div>

              <div className="col-span-2 text-right">
                <div className="font-mono text-[11px] text-muted-foreground">
                  {dateShort(row.dueDate)}
                </div>
                <div
                  data-slot="numeric"
                  className={`mt-0.5 text-[11px] font-medium ${ageTone(row.daysOverdue)}`}
                >
                  {ageLabel(row.daysOverdue)}
                </div>
              </div>
            </div>

            {row.reminder && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : row.id)}
                  aria-expanded={open}
                  className="pressable inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ease-[var(--ease-out)] ${open ? "rotate-180" : ""}`}
                  />
                  Draft reminder
                </button>

                {open && (
                  <div className="slide-up-in mt-3 rounded-sm border border-border/60 bg-muted/20 p-4">
                    <div className="text-[11.5px] font-medium text-muted-foreground/70">
                      Subject
                    </div>
                    <div className="mt-1 text-[12.5px] text-foreground">
                      {row.reminder.subject}
                    </div>
                    <textarea
                      readOnly
                      value={row.reminder.body}
                      rows={14}
                      className="mt-3 w-full resize-none rounded-sm border border-border bg-card px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-foreground focus:border-foreground focus:outline-none"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyDraft(row)}
                        className="pressable inline-flex h-7 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
                      >
                        {copiedId === row.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                      {mailto ? (
                        <a
                          href={mailto}
                          className="pressable inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                        >
                          <Mail className="h-3 w-3" />
                          Open in email
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          No client email on file — copy the draft instead.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
      {rows.length === 0 && (
        <EmptyRow>
          Nothing to chase — no invoices are awaiting client payment right now.
        </EmptyRow>
      )}
    </ul>
  );
}
