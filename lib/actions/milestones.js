"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

function revalidateMilestonePages() {
  revalidatePath("/admin/milestones");
  revalidatePath("/admin/community");
  revalidatePath("/talent/milestones");
  revalidatePath("/talent/overview");
}

// Talent opts in to sharing a booking as a milestone. Enters the admin
// approval queue (admin_approved=false, is_published=false — enforced by RLS).
export async function submitMilestone(prevState, formData) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      bookingId: z.string().uuid("Missing booking id"),
      visibility: z.enum(["named", "anonymous"]).default("named"),
      displayText: z.string().max(500).optional(),
    })
    .safeParse({
      bookingId: field(formData, "bookingId"),
      visibility: field(formData, "visibility"),
      displayText: field(formData, "displayText"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  const { data: me } = await supabase
    .from("talent_profiles")
    .select("id, first_name")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!me) return { error: "No talent profile linked to your account" };

  // RLS scopes bookings to the caller — a foreign id simply won't be found.
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, project_title")
    .eq("id", v.bookingId)
    .maybeSingle();
  if (!booking) return { error: "Booking not found" };

  const displayText =
    v.displayText ??
    (v.visibility === "named"
      ? `${me.first_name} completed "${booking.project_title}"`
      : `A Candor talent completed "${booking.project_title}"`);

  const { error } = await supabase.from("milestones").insert({
    talent_id: me.id,
    booking_id: booking.id,
    visibility: v.visibility,
    display_text: displayText,
    admin_approved: false,
    is_published: false,
  });
  if (error) return { error: "Could not submit your milestone" };

  revalidateMilestonePages();
  return { success: true };
}

// Admin approves and publishes. Any admin role (per permission matrix).
export async function approveMilestone(milestoneId) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(milestoneId);
  if (!parsed.success) return { error: "Missing milestone id" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .update({ admin_approved: true, is_published: true, approved_by: profile.id })
    .eq("id", parsed.data);
  if (error) return { error: "Could not approve the milestone" };

  revalidateMilestonePages();
  return { success: true };
}

// Admin rejects (deletes) a queued milestone; optional reason is sent to the
// talent as a general notification.
export async function rejectMilestone(milestoneId, reason) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      milestoneId: z.string().uuid(),
      reason: z.string().max(1000).optional(),
    })
    .safeParse({ milestoneId, reason: reason || undefined });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", parsed.data.milestoneId)
    .select("talent_id, booking_id");
  if (error) return { error: "Could not reject the milestone" };
  if (!data?.length) return { error: "Milestone not found" };

  if (parsed.data.reason) {
    await supabase.from("notifications").insert({
      talent_id: data[0].talent_id,
      sender_id: profile.id,
      type: "general",
      title: "Milestone not published",
      body: parsed.data.reason,
      booking_id: data[0].booking_id,
      requires_response: false,
    });
  }

  revalidateMilestonePages();
  return { success: true };
}

// Admin edits the display text (e.g. to strip a client name) and approves in
// one step.
export async function editAndApproveMilestone(milestoneId, displayText) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      milestoneId: z.string().uuid(),
      displayText: z.string().min(1, "Display text is required").max(500),
    })
    .safeParse({ milestoneId, displayText });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .update({
      display_text: parsed.data.displayText,
      admin_approved: true,
      is_published: true,
      approved_by: profile.id,
    })
    .eq("id", parsed.data.milestoneId);
  if (error) return { error: "Could not approve the milestone" };

  revalidateMilestonePages();
  return { success: true };
}
