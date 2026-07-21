"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BODY = z.string().trim().min(1, "Say something first").max(4000, "Keep it under 4000 characters");

async function guard(...roles) {
  try {
    return await assertRole(...roles);
  } catch {
    return null;
  }
}

async function myTalentId(supabase, userId) {
  const { data } = await supabase
    .from("talent_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

function revalidateThreads() {
  revalidatePath("/talent/communications");
  revalidatePath("/talent/overview");
  revalidatePath("/admin/communications");
  revalidatePath("/talent", "layout");
}

// Talent sends a free-form message to their team.
export async function sendMessageAsTalent(body) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = BODY.safeParse(body);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const talentId = await myTalentId(supabase, profile.id);
  if (!talentId) return { error: "No talent profile linked to your account" };

  const { error } = await supabase.from("messages").insert({
    talent_id: talentId,
    sender_id: profile.id,
    sender_is_talent: true,
    body: parsed.data,
  });
  if (error) return { error: "Could not send your message" };

  revalidateThreads();
  return { success: true };
}

// Admin sends a free-form chat message into a talent's thread.
export async function sendMessageAsAdmin(talentId, body) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({ talentId: z.string().uuid(), body: BODY })
    .safeParse({ talentId, body });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    talent_id: parsed.data.talentId,
    sender_id: profile.id,
    sender_is_talent: false,
    body: parsed.data.body,
  });
  if (error) return { error: "Could not send the message" };

  revalidateThreads();
  return { success: true };
}

// Opening the thread reads it — talent marks the agency's messages read.
export async function markMessagesReadAsTalent() {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_is_talent", false)
    .eq("is_read", false);
  if (error) return { error: "Could not update the thread" };

  revalidateThreads();
  return { success: true };
}

// Admin opens a talent's thread — their incoming messages become read.
export async function markThreadReadAsAdmin(talentId) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(talentId);
  if (!parsed.success) return { error: "Missing talent id" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("talent_id", parsed.data)
    .eq("sender_is_talent", true)
    .eq("is_read", false);
  if (error) return { error: "Could not update the thread" };

  revalidatePath("/admin/communications");
  return { success: true };
}
