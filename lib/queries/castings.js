import "server-only";
import { createClient } from "@/lib/supabase/server";

// Admin casting board list — full base table including the INTERNAL
// client/brand columns (RLS: talent get zero rows here) + interest counts.
export async function listCastings({ status } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("open_castings")
    .select(
      `id, title, description, category, location, shoot_date_start, shoot_date_end,
       work_type, media_usage, requirements, deadline, status,
       brand_name_internal, created_at,
       client:clients(id, company_name),
       interests:casting_interests(id, response)`
    )
    .order("deadline", { ascending: true });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error("Could not load castings");

  return (data ?? []).map(({ interests, ...casting }) => ({
    ...casting,
    responsesCount: interests?.length ?? 0,
    interestedCount: (interests ?? []).filter((i) => i.response === "interested")
      .length,
  }));
}

// Talent casting board: open castings from the sanitized view (no client or
// brand columns) with this talent's own interest state attached.
// myInterest: { response, calendar_conflict, shortlisted, selected } | null.
export async function openCastingsForTalent() {
  const supabase = await createClient();
  const [castingsRes, interestsRes] = await Promise.all([
    supabase
      .from("open_castings_public")
      .select("*")
      .order("deadline", { ascending: true }),
    // RLS limits this to the caller's own interest rows.
    supabase
      .from("casting_interests")
      .select("casting_id, response, calendar_conflict, conflict_details, shortlisted, selected"),
  ]);
  if (castingsRes.error) throw new Error("Could not load the casting board");

  const mine = new Map(
    (interestsRes.data ?? []).map((i) => [i.casting_id, i])
  );
  return (castingsRes.data ?? []).map((c) => ({
    ...c,
    myInterest: mine.get(c.id) ?? null,
  }));
}

// Admin casting detail with all expressions of interest (talent joined, with
// measurements summary for side-by-side comparison).
export async function getCastingById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("open_castings")
    .select(
      `*,
       client:clients(id, company_name),
       interests:casting_interests(id, response, calendar_conflict, conflict_details,
         shortlisted, selected, created_at,
         talent:talent_profiles(id, first_name, last_name, category, primary_location, polaroid_url,
           measurements:talent_measurements(height_display, bust, waist, hips, shoe_uk, dress_size)))`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Could not load this casting");
  if (!data) return null;

  return {
    ...data,
    interests: (data.interests ?? []).sort((a, b) =>
      a.created_at < b.created_at ? -1 : 1
    ),
  };
}
