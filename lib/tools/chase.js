// Payment-terms parsing, due-date math and the reminder email template for
// the chase list + invoice studio. Plain module — safe in both server and
// client components (no supabase, no server-only APIs).

import { dateShort, money } from "@/lib/format";

const DAY_MS = 86400000;

// "100% upfront" → 0 · "Net 14" → 14 · "net 30 days" → 30 · anything else → 14
export function termsDays(paymentTerms) {
  const terms = String(paymentTerms || "").toLowerCase();
  if (terms.includes("upfront")) return 0;
  const match = terms.match(/net\s*(\d+)/);
  if (match) return Number(match[1]);
  return 14;
}

// Due date = payment raised date + terms days. daysOverdue compares calendar
// days: positive = overdue, 0 = due today, negative = not yet due.
export function dueInfo(createdAt, paymentTerms) {
  const raised = new Date(createdAt);
  const due = new Date(raised.getTime() + termsDays(paymentTerms) * DAY_MS);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysOverdue = Math.round((startOfDay(new Date()) - startOfDay(due)) / DAY_MS);
  return { dueDate: due.toISOString(), daysOverdue };
}

// Template-generated reminder (no AI). `p` is a listOverduePayments row —
// payment + booking(client) + talent + dueDate/daysOverdue.
export function reminderEmail(p) {
  const client = p.booking?.client;
  const invoiceNo = p.invoice_number || "INV-DRAFT";
  const project = p.booking?.project_title || "your recent booking";
  const overdueNote =
    p.daysOverdue > 0
      ? ` (${p.daysOverdue} day${p.daysOverdue === 1 ? "" : "s"} overdue)`
      : p.daysOverdue === 0
        ? " (due today)"
        : "";

  const subject = `Payment reminder — ${invoiceNo} · ${project}`;

  const body = [
    `Dear ${client?.contact_person || client?.company_name || "client"},`,
    "",
    `I hope this finds you well. This is a courtesy reminder from Candor Management Agency that the payment below remains outstanding.`,
    "",
    `  Invoice     ${invoiceNo}`,
    `  Project     ${project}`,
    `  Amount due  ${money(p.gross_fee, p.currency)}`,
    `  Terms       ${client?.payment_terms || "Net 14"}`,
    `  Due date    ${dateShort(p.dueDate)}${overdueNote}`,
    "",
    `We would appreciate settlement at your earliest convenience. If payment has already been made, please disregard this reminder — and thank you.`,
    "",
    `Should anything be needed from our side to process this payment, write to contact@candor-management.com and we will assist promptly.`,
    "",
    "Kind regards,",
    "Candor Management Agency",
    "Lagos · London · USA",
    "contact@candor-management.com",
  ].join("\n");

  return { subject, body };
}
