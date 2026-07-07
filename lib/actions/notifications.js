"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const NOTIFICATION_TYPES = [
  "availability_check", "booking_update", "portfolio_request",
  "payment_update", "general", "pre_job_brief", "announcement",
];
// Types whose messages show action buttons and feed the escalation job.
const RESPONSE_TYPES = [
  "availability_check", "booking_update", "portfolio_request", "pre_job_brief",
];
// What a talent may set response_status to (never back to "pending" etc.).
const TALENT_RESPONSES = ["accepted", "declined", "confirmed", "queried"];

async function guard(...roles) {
  try {
    return await assertRole(...roles);
  } catch {
    return null;
  }
}

function field(formData, name) {
  const v = formData.get(name);
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

// The caller's talent_profiles row id (RLS-scoped read). Null for admins.
async function myTalentId(supabase, userId) {
  const { data } = await supabase
    .from("talent_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

// Admin compose. Send talentIds as one or more form entries
// (formData.append("talentIds", id)). One id => direct notification; several
// => one broadcast row + per-recipient notification_recipients rows.
export async function sendNotification(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      talentIds: z.array(z.string().uuid()).min(1, "Pick at least one recipient"),
      type: z.enum(NOTIFICATION_TYPES, { message: "Pick a notification type" }),
      title: z.string().min(1, "Title is required").max(255),
      body: z.string().min(1, "Message body is required"),
      bookingId: z.string().uuid().optional(),
    })
    .safeParse({
      talentIds: formData.getAll("talentIds").map(String).filter(Boolean),
      type: field(formData, "type"),
      title: field(formData, "title"),
      body: field(formData, "body"),
      bookingId: field(formData, "bookingId"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  const base = {
    sender_id: profile.id,
    type: v.type,
    title: v.title,
    body: v.body,
    booking_id: v.bookingId ?? null,
    requires_response: RESPONSE_TYPES.includes(v.type),
  };

  if (v.talentIds.length === 1) {
    const { error } = await supabase
      .from("notifications")
      .insert({ ...base, talent_id: v.talentIds[0] });
    if (error) return { error: "Could not send the notification" };
  } else {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({ ...base, talent_id: null })
      .select("id")
      .single();
    if (error) return { error: "Could not send the notification" };

    const { error: recipientsError } = await supabase
      .from("notification_recipients")
      .insert(
        v.talentIds.map((talentId) => ({
          notification_id: notification.id,
          talent_id: talentId,
        }))
      );
    if (recipientsError) {
      // Don't leave a broadcast with no recipients behind.
      await supabase.from("notifications").delete().eq("id", notification.id);
      return { error: "Could not send the notification" };
    }
  }

  revalidatePath("/admin/communications");
  revalidatePath("/talent/communications");
  revalidatePath("/talent/overview");
  return { success: true, recipientCount: v.talentIds.length };
}

// Talent responds to an actionable message. Updates the direct notification
// row or, for broadcasts, the caller's notification_recipients row.
export async function respondToNotification(notificationId, response, responseText) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      notificationId: z.string().uuid(),
      response: z.enum(TALENT_RESPONSES, { message: "Invalid response" }),
      responseText: z.string().max(2000).optional(),
    })
    .safeParse({
      notificationId,
      response,
      responseText: responseText || undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  const talentId = await myTalentId(supabase, profile.id);
  if (!talentId) return { error: "No talent profile linked to your account" };

  // RLS already limits visibility to the caller's own notifications.
  const { data: notification } = await supabase
    .from("notifications")
    .select("id, talent_id, requires_response")
    .eq("id", v.notificationId)
    .maybeSingle();
  if (!notification) return { error: "Message not found" };
  if (!notification.requires_response) {
    return { error: "This message doesn't need a response" };
  }

  const patch = {
    response_status: v.response,
    response_text: v.responseText ?? null,
    responded_at: new Date().toISOString(),
    is_read: true,
  };

  const { error } =
    notification.talent_id === talentId
      ? await supabase.from("notifications").update(patch).eq("id", notification.id)
      : await supabase
          .from("notification_recipients")
          .update(patch)
          .eq("notification_id", notification.id)
          .eq("talent_id", talentId);
  if (error) return { error: "Could not save your response" };

  revalidatePath("/talent/communications");
  revalidatePath("/talent/overview");
  revalidatePath("/admin/communications");
  return { success: true };
}

// Talent marks a message read (direct or broadcast).
export async function markNotificationRead(notificationId) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(notificationId);
  if (!parsed.success) return { error: "Missing notification id" };

  const supabase = await createClient();
  const talentId = await myTalentId(supabase, profile.id);
  if (!talentId) return { error: "No talent profile linked to your account" };

  const { data: notification } = await supabase
    .from("notifications")
    .select("id, talent_id")
    .eq("id", parsed.data)
    .maybeSingle();
  if (!notification) return { error: "Message not found" };

  const { error } =
    notification.talent_id === talentId
      ? await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notification.id)
      : await supabase
          .from("notification_recipients")
          .update({ is_read: true })
          .eq("notification_id", notification.id)
          .eq("talent_id", talentId);
  if (error) return { error: "Could not update the message" };

  revalidatePath("/talent/communications");
  revalidatePath("/talent/overview");
  return { success: true };
}
