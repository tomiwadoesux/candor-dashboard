import "server-only";
import { createClient } from "@/lib/supabase/server";

// Admin-only view of Ask Candor activity. RLS: admins can SELECT
// ai_conversations but not write them; talent only ever see their own.
export async function listAiConversations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_conversations")
    .select(
      `id, messages, created_at, updated_at,
       talent:talent_profiles(id, first_name, last_name, category, polaroid_url)`
    )
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Could not load AI activity");
  return (data ?? []).map((c) => {
    const messages = Array.isArray(c.messages) ? c.messages : [];
    const last = messages[messages.length - 1];
    return {
      id: c.id,
      talent: c.talent,
      messages,
      messageCount: messages.length,
      questionCount: messages.filter((m) => m.role === "user").length,
      lastMessage: last?.content ?? null,
      lastRole: last?.role ?? null,
      updatedAt: c.updated_at,
    };
  });
}
