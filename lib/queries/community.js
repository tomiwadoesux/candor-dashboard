import "server-only";
import { createClient } from "@/lib/supabase/server";

// Talent directory for logged-in talent. Reads the public_roster view
// (marketing-safe columns only: no phone, DOB, contract or commission data),
// which is the only cross-talent read the RLS model allows.
export async function talentDirectory({ q, category } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("public_roster")
    .select("id, first_name, last_name, category, primary_location, instagram_handle, bio, polaroid_url")
    .order("first_name", { ascending: true });

  if (category) query = query.eq("category", category);
  if (q) {
    const term = q.replace(/[,()%]/g, " ").trim();
    if (term) {
      query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load the talent directory");
  return data;
}

// Talent community feed: published milestones + open castings, merged and
// sorted newest first. Named milestones are enriched with the talent's public
// roster entry (name + polaroid); anonymous ones carry talent: null.
// Items: { kind: "milestone", id, createdAt, displayText, visibility, talent }
//      | { kind: "casting", id, createdAt, casting }
export async function communityFeed() {
  const supabase = await createClient();
  const [milestonesRes, castingsRes] = await Promise.all([
    supabase
      .from("milestones")
      .select("id, talent_id, visibility, display_text, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("open_castings_public")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);
  if (milestonesRes.error || castingsRes.error) {
    throw new Error("Could not load the community feed");
  }

  const milestones = milestonesRes.data ?? [];
  const namedIds = [
    ...new Set(
      milestones.filter((m) => m.visibility === "named").map((m) => m.talent_id)
    ),
  ];
  const names = {};
  if (namedIds.length) {
    const { data: roster } = await supabase
      .from("public_roster")
      .select("id, first_name, last_name, polaroid_url")
      .in("id", namedIds);
    for (const r of roster ?? []) names[r.id] = r;
  }

  return [
    ...milestones.map((m) => ({
      kind: "milestone",
      id: m.id,
      createdAt: m.created_at,
      displayText: m.display_text,
      visibility: m.visibility,
      talent: m.visibility === "named" ? (names[m.talent_id] ?? null) : null,
    })),
    ...(castingsRes.data ?? []).map((c) => ({
      kind: "casting",
      id: c.id,
      createdAt: c.created_at,
      casting: c,
    })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
