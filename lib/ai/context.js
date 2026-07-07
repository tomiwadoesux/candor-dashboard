import "server-only";
import { money, dateShort, timeShort, statusLabel } from "@/lib/format";

// Builds the per-talent markdown dossier the AI is grounded in — the "MD file"
// for the account, regenerated from the live database on every question so it
// can never go stale. The supabase client passed in is the SIGNED-IN TALENT'S
// RLS-scoped client: every query below can only return that talent's rows, so
// one talent's dossier can never contain another talent's data.
export async function buildTalentDossier(supabase, talent) {
  const [measurements, bookings, payments, notifications, castings, milestones, documents] =
    await Promise.all([
      supabase
        .from("talent_measurements")
        .select("height_display, bust, waist, hips, shoe_uk, shoe_eu, hair_colour, eye_colour, dress_size")
        .eq("talent_id", talent.id)
        .maybeSingle(),
      supabase
        .from("bookings")
        .select(
          "project_title, service_type, status, booking_date, booking_end_date, call_time, location_city, location_address, duration_description, talent_fee, fee_currency, media_usage, territory, usage_term, overtime_rate, notes"
        )
        .order("booking_date", { ascending: false })
        .limit(30),
      supabase
        .from("payments")
        .select(
          "gross_fee, commission_rate, commission_amount, net_talent_payment, currency, status, client_payment_date, talent_payment_date, invoice_number, booking:bookings(project_title)"
        )
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("notifications")
        .select("type, title, body, requires_response, response_status, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("open_castings_public")
        .select("id, title, category, location, shoot_date_start, shoot_date_end, work_type, requirements, deadline"),
      supabase
        .from("milestones")
        .select("display_text, is_published, admin_approved, created_at")
        .eq("talent_id", talent.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("documents")
        .select("title, document_type, date_signed, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  // My interest state per casting (own rows only under RLS).
  const { data: interests } = await supabase
    .from("casting_interests")
    .select("casting_id, response, calendar_conflict, conflict_details, shortlisted, selected");
  const interestByCasting = new Map((interests ?? []).map((i) => [i.casting_id, i]));

  const today = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push(`# Candor account dossier — ${talent.first_name} ${talent.last_name}`);
  lines.push(`Generated live from the Candor database. Today's date: ${today}. Commission: ${Number(talent.commission_rate)}% of gross fees.`);
  lines.push("");
  lines.push("## Profile");
  lines.push(`- Category: ${statusLabel(talent.category)} · Status: ${statusLabel(talent.status)} · ${statusLabel(talent.exclusivity)}`);
  lines.push(`- Base: ${statusLabel(talent.primary_location)}${talent.secondary_location ? ` / ${statusLabel(talent.secondary_location)}` : ""} · Instagram: ${talent.instagram_handle ?? "—"}`);
  lines.push(`- Contract: ${statusLabel(talent.contract_type)}, ${dateShort(talent.contract_start_date)} → ${dateShort(talent.contract_end_date)}`);
  lines.push(`- Portfolio status: comp card ${statusLabel(talent.comp_card_status)}, digitals ${statusLabel(talent.digitals_status)}${talent.next_scheduled_shoot ? `, next shoot ${dateShort(talent.next_scheduled_shoot)}` : ""}${talent.last_test_shoot ? `, last test shoot ${dateShort(talent.last_test_shoot)}` : ""}`);
  if (talent.portfolio_notes) lines.push(`- Booker note: ${talent.portfolio_notes}`);

  const m = measurements.data;
  if (m) {
    lines.push("");
    lines.push("## Measurements");
    lines.push(
      `Height ${m.height_display ?? "—"} · Bust ${m.bust ?? "—"} · Waist ${m.waist ?? "—"} · Hips ${m.hips ?? "—"} · Shoe ${m.shoe_uk ?? "—"}${m.shoe_eu ? ` (${m.shoe_eu})` : ""} · Hair ${m.hair_colour ?? "—"} · Eyes ${m.eye_colour ?? "—"}${m.dress_size ? ` · Dress ${m.dress_size}` : ""}`
    );
  }

  lines.push("");
  lines.push("## Bookings (newest first)");
  for (const b of bookings.data ?? []) {
    const dates = b.booking_end_date && b.booking_end_date !== b.booking_date
      ? `${dateShort(b.booking_date)} – ${dateShort(b.booking_end_date)}`
      : dateShort(b.booking_date);
    lines.push(
      `- ${b.project_title} (${b.service_type ?? "job"}): ${statusLabel(b.status)}. ${dates}${b.call_time ? `, call time ${timeShort(b.call_time)}` : ""}. Location: ${statusLabel(b.location_city)}${b.location_address ? `, ${b.location_address}` : ""}. Fee: ${money(b.talent_fee, b.fee_currency)} gross${b.media_usage ? `. Usage: ${b.media_usage}` : ""}${b.territory ? `, ${b.territory}` : ""}${b.usage_term ? `, ${b.usage_term}` : ""}${b.notes ? `. Note: ${b.notes}` : ""}`
    );
  }
  if (!bookings.data?.length) lines.push("- No bookings yet.");

  lines.push("");
  lines.push("## Payments (newest first) — net = gross minus commission");
  for (const p of payments.data ?? []) {
    lines.push(
      `- ${p.booking?.project_title ?? "Booking"}: gross ${money(p.gross_fee, p.currency)}, commission ${money(p.commission_amount, p.currency)} (${Number(p.commission_rate)}%), net ${money(p.net_talent_payment, p.currency)} — ${statusLabel(p.status)}${p.talent_payment_date ? `, paid to talent ${dateShort(p.talent_payment_date)}` : p.client_payment_date ? `, client paid ${dateShort(p.client_payment_date)}` : ""}${p.invoice_number ? ` (${p.invoice_number})` : ""}`
    );
  }
  if (!payments.data?.length) lines.push("- No payments yet.");

  lines.push("");
  lines.push("## Open castings on the board (brand names are confidential until selection — never guess them)");
  for (const c of castings.data ?? []) {
    const mine = interestByCasting.get(c.id);
    const state = mine
      ? mine.selected
        ? "you are SELECTED"
        : mine.shortlisted
          ? "you are shortlisted"
          : `you responded: ${statusLabel(mine.response)}${mine.calendar_conflict ? ` (calendar conflict: ${mine.conflict_details})` : ""}`
      : "you have not responded";
    lines.push(
      `- ${c.title} (${statusLabel(c.category)}, ${statusLabel(c.location)}): shoots ${dateShort(c.shoot_date_start)}${c.shoot_date_end ? `–${dateShort(c.shoot_date_end)}` : ""}, deadline ${dateShort(c.deadline)}. Requirements: ${c.requirements ?? "—"}. Your status: ${state}.`
    );
  }
  if (!castings.data?.length) lines.push("- No open castings right now.");

  lines.push("");
  lines.push("## Recent messages from Candor");
  for (const n of notifications.data ?? []) {
    lines.push(
      `- [${dateShort(n.created_at)}] ${statusLabel(n.type)}: ${n.title}${n.requires_response ? ` (response: ${statusLabel(n.response_status)})` : ""}`
    );
  }
  if (!notifications.data?.length) lines.push("- No messages yet.");

  lines.push("");
  lines.push("## Documents on file");
  for (const d of documents.data ?? []) {
    lines.push(`- ${d.title} (${statusLabel(d.document_type)}${d.date_signed ? `, signed ${dateShort(d.date_signed)}` : ""})`);
  }
  if (!documents.data?.length) lines.push("- No documents yet.");

  const ms = milestones.data ?? [];
  if (ms.length) {
    lines.push("");
    lines.push("## My milestones");
    for (const mi of ms) {
      lines.push(`- ${mi.display_text} — ${mi.is_published ? "published" : mi.admin_approved ? "approved" : "awaiting approval"}`);
    }
  }

  return lines.join("\n");
}
