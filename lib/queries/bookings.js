import "server-only";
import { createClient } from "@/lib/supabase/server";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Admin list across all talent. Talent callers would only see their own rows
// (RLS), but the client embed would be null for them — prefer myBookingsSplit.
export async function listBookings({ status, talentId, clientId, from, to } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select(
      `id, project_title, service_type, status, booking_date, booking_end_date, call_time,
       location_city, talent_fee, fee_currency, total_client_fee, media_usage,
       pre_job_brief_sent, call_sheet_sent, created_at,
       talent:talent_profiles(id, first_name, last_name),
       client:clients(id, company_name)`
    )
    .order("booking_date", { ascending: false });

  if (status) query = query.eq("status", status);
  if (talentId) query = query.eq("talent_id", talentId);
  if (clientId) query = query.eq("client_id", clientId);
  if (from) query = query.gte("booking_date", from);
  if (to) query = query.lte("booking_date", to);

  const { data, error } = await query;
  if (error) throw new Error("Could not load bookings");
  return data;
}

// Full booking detail: talent, client, status history (newest first),
// payments and documents attached to the booking. Admin-facing; for talent
// the client/status_history embeds come back null/empty (RLS).
export async function getBookingById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `*,
       talent:talent_profiles(id, first_name, last_name, category, polaroid_url, commission_rate),
       client:clients(id, company_name, contact_person, email, client_type, payment_terms),
       status_history:booking_status_history(id, old_status, new_status, created_at, changed_by:profiles(id, full_name)),
       payments(id, gross_fee, commission_amount, net_talent_payment, currency, status, invoice_number, client_payment_date, talent_payment_date),
       documents(id, title, document_type, file_url, created_at)`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Could not load this booking");
  if (!data) return null;

  return {
    ...data,
    status_history: (data.status_history ?? []).sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1
    ),
  };
}

// Talent view: own bookings (RLS-scoped) split into upcoming and past.
// Upcoming: booking_date >= today, not cancelled/completed, soonest first.
// Past: everything else, most recent first.
export async function myBookingsSplit() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, project_title, service_type, status, booking_date, booking_end_date, call_time,
       location_city, location_address, duration_description, talent_fee, fee_currency,
       media_usage, territory, usage_term, overtime_rate, notes, created_at`
    )
    .order("booking_date", { ascending: true });
  if (error) throw new Error("Could not load your bookings");

  const today = todayISO();
  const upcoming = [];
  const past = [];
  for (const b of data ?? []) {
    if (
      b.booking_date >= today &&
      b.status !== "cancelled" &&
      b.status !== "completed"
    ) {
      upcoming.push(b);
    } else {
      past.push(b);
    }
  }
  past.reverse();
  return { upcoming, past };
}

// Talent calendar: own bookings overlapping [from, to] (ISO date strings).
export async function myBookingsInRange(from, to) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, project_title, status, booking_date, booking_end_date, call_time, location_city"
    )
    .lte("booking_date", to)
    .order("booking_date", { ascending: true });
  if (error) throw new Error("Could not load your calendar");
  return (data ?? []).filter(
    (b) => (b.booking_end_date ?? b.booking_date) >= from
  );
}
