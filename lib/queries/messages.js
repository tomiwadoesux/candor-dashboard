import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getMyTalentProfile } from "@/lib/queries/talent";

// The signed-in talent's chat thread with the agency, oldest first.
// RLS scopes rows to the caller's own talent_id.
export async function myMessages() {
  const me = await getMyTalentProfile();
  if (!me) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, talent_id, sender_id, sender_is_talent, body, is_read, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error("Could not load your messages");
  return data ?? [];
}

// Admin: every chat message across the roster, with sender + talent names,
// oldest first — the messenger groups them into per-talent threads.
export async function listAllMessages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(
      `id, talent_id, sender_id, sender_is_talent, body, is_read, created_at,
       sender:profiles(id, full_name),
       talent:talent_profiles(id, first_name, last_name)`
    )
    .order("created_at", { ascending: true });
  if (error) throw new Error("Could not load messages");
  return data ?? [];
}
