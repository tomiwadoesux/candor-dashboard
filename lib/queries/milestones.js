import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getMyTalentProfile } from "@/lib/queries/talent";

const ADMIN_SELECT = `id, visibility, display_text, admin_approved, is_published, created_at,
  talent:talent_profiles(id, first_name, last_name, polaroid_url),
  booking:bookings(id, project_title, booking_date, client:clients(company_name)),
  approved_by:profiles(id, full_name)`;

// Admin approval queue: submitted but not yet approved, oldest first.
export async function pendingMilestones() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select(ADMIN_SELECT)
    .eq("admin_approved", false)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Could not load the milestone queue");
  return data;
}

// All published milestones, newest first. Readable by talent too (RLS), but
// the talent/booking embeds are only populated for admins — talent-facing
// feeds should use communityFeed() in lib/queries/community.js.
export async function publishedMilestones() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select(ADMIN_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load milestones");
  return data;
}

// The signed-in talent's own milestone submissions (any approval state).
export async function myMilestones() {
  const me = await getMyTalentProfile();
  if (!me) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select(
      `id, visibility, display_text, admin_approved, is_published, created_at,
       booking:bookings(id, project_title, booking_date)`
    )
    .eq("talent_id", me.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your milestones");
  return data;
}
