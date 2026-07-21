import "server-only";
import { createClient } from "@/lib/supabase/server";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Availability radar: every active talent (optionally one category) with their
// pending/confirmed bookings overlapping [from, to]. Overlap:
//   booking_date <= to AND coalesce(booking_end_date, booking_date) >= from.
// Per talent: { ...talent fields, conflicts: [{ project_title, status,
// booking_date, booking_end_date }], state } where state is
// "available" (no conflicts) | "pencilled" (only pending) | "booked" (any confirmed).
export async function checkAvailability({ from, to, category } = {}) {
  if (!ISO_DATE.test(from ?? "") || !ISO_DATE.test(to ?? "")) {
    throw new Error("Pick a valid date window");
  }

  const supabase = await createClient();

  let talentQuery = supabase
    .from("talent_profiles")
    .select("id, first_name, last_name, category, primary_location, polaroid_url")
    .eq("status", "active")
    .order("first_name", { ascending: true });
  if (category) talentQuery = talentQuery.eq("category", category);

  const bookingsQuery = supabase
    .from("bookings")
    .select("talent_id, project_title, status, booking_date, booking_end_date")
    .in("status", ["pending", "confirmed"])
    .lte("booking_date", to)
    .or(
      `booking_end_date.gte.${from},and(booking_end_date.is.null,booking_date.gte.${from})`
    )
    .order("booking_date", { ascending: true });

  const unavailabilityQuery = supabase
    .from("talent_unavailability")
    .select("talent_id, start_date, end_date, reason")
    .lte("start_date", to)
    .gte("end_date", from)
    .order("start_date", { ascending: true });

  const [talentRes, bookingsRes, awayRes] = await Promise.all([
    talentQuery,
    bookingsQuery,
    unavailabilityQuery,
  ]);
  if (talentRes.error) throw new Error("Could not load the talent roster");
  if (bookingsRes.error) throw new Error("Could not load bookings for this window");
  if (awayRes.error) throw new Error("Could not load out-dates for this window");

  const conflictsByTalent = new Map();
  for (const b of bookingsRes.data ?? []) {
    const list = conflictsByTalent.get(b.talent_id) ?? [];
    list.push({
      project_title: b.project_title,
      status: b.status,
      booking_date: b.booking_date,
      booking_end_date: b.booking_end_date,
    });
    conflictsByTalent.set(b.talent_id, list);
  }

  // Talent-declared out-dates render as neutral "away" conflicts.
  const awayByTalent = new Map();
  for (const a of awayRes.data ?? []) {
    const list = awayByTalent.get(a.talent_id) ?? [];
    list.push({
      project_title: a.reason ? `Away — ${a.reason}` : "Marked unavailable",
      status: "away",
      booking_date: a.start_date,
      booking_end_date: a.end_date,
    });
    awayByTalent.set(a.talent_id, list);
  }

  return (talentRes.data ?? []).map((t) => {
    const bookings = conflictsByTalent.get(t.id) ?? [];
    const away = awayByTalent.get(t.id) ?? [];
    const conflicts = [...bookings, ...away];
    const state =
      bookings.some((c) => c.status === "confirmed")
        ? "booked"
        : away.length > 0
          ? "away"
          : bookings.length > 0
            ? "pencilled"
            : "available";
    return { ...t, conflicts, state };
  });
}

// The signed-in talent's own out-dates, soonest first (RLS-scoped).
export async function myUnavailability() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_unavailability")
    .select("id, start_date, end_date, reason, created_at")
    .order("start_date", { ascending: true });
  if (error) throw new Error("Could not load your out-dates");
  return data ?? [];
}
