import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMyTalentProfile } from "@/lib/queries/talent";

// Admin sent-notifications list with per-recipient response state.
// tab: "all" | "escalated" (10h no response) | "awaiting" (response still pending).
// Direct sends carry `talent`; broadcasts have talent null + `recipients` rows.
export async function listNotifications({ tab = "all" } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select(
      `id, type, title, body, booking_id, is_read, requires_response, response_status,
       response_text, responded_at, escalated, escalated_at, created_at,
       sender:profiles(id, full_name),
       talent:talent_profiles(id, first_name, last_name),
       recipients:notification_recipients(id, is_read, response_status, response_text, responded_at,
         talent:talent_profiles(id, first_name, last_name))`
    )
    .order("created_at", { ascending: false });

  if (tab === "escalated") {
    query = query.eq("escalated", true);
  } else if (tab === "awaiting") {
    query = query.eq("requires_response", true).eq("response_status", "pending");
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load notifications");
  return data;
}

// Talent inbox: direct + broadcast notifications, normalized so read/response
// state always reflects THIS talent (broadcast state lives on the recipient row).
export async function myNotifications() {
  const me = await getMyTalentProfile();
  if (!me) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `id, talent_id, type, title, body, booking_id, is_read, requires_response,
       response_status, response_text, responded_at, created_at,
       recipient:notification_recipients(id, is_read, response_status, response_text, responded_at)`
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your messages");

  return (data ?? []).map((n) => {
    const direct = n.talent_id === me.id;
    // RLS leaves at most the caller's own recipient row in the embed.
    const r = Array.isArray(n.recipient) ? n.recipient[0] : n.recipient;
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      bookingId: n.booking_id,
      requiresResponse: n.requires_response,
      createdAt: n.created_at,
      isBroadcast: !direct,
      isRead: direct ? n.is_read : (r?.is_read ?? false),
      responseStatus: direct ? n.response_status : (r?.response_status ?? "pending"),
      responseText: direct ? n.response_text : (r?.response_text ?? null),
      respondedAt: direct ? n.responded_at : (r?.responded_at ?? null),
    };
  });
}

// Unread badge count for the signed-in talent (direct + broadcast + chat).
export const unreadCount = cache(async () => {
  const me = await getMyTalentProfile();
  if (!me) return 0;

  const supabase = await createClient();
  const [direct, broadcast, chat] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("talent_id", me.id)
      .eq("is_read", false),
    supabase
      .from("notification_recipients")
      .select("id", { count: "exact", head: true })
      .eq("talent_id", me.id)
      .eq("is_read", false),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_is_talent", false)
      .eq("is_read", false),
  ]);
  return (direct.count ?? 0) + (broadcast.count ?? 0) + (chat.count ?? 0);
});
