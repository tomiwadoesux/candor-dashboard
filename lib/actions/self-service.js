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

async function myTalentId(supabase, userId) {
  const { data } = await supabase
    .from("talent_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

function field(formData, name) {
  const v = formData.get(name);
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? null : s;
}

const short = (max) => z.string().max(max).nullish();

// Talent refreshes their own measurements card (RLS: own row only).
export async function updateMyMeasurements(prevState, formData) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      height_display: short(20),
      bust: short(10),
      waist: short(10),
      hips: short(10),
      shoe_uk: short(10),
      dress_size: short(20),
      hair_colour: short(50),
      eye_colour: short(50),
    })
    .safeParse({
      height_display: field(formData, "height_display"),
      bust: field(formData, "bust"),
      waist: field(formData, "waist"),
      hips: field(formData, "hips"),
      shoe_uk: field(formData, "shoe_uk"),
      dress_size: field(formData, "dress_size"),
      hair_colour: field(formData, "hair_colour"),
      eye_colour: field(formData, "eye_colour"),
    });
  if (!parsed.success) return { error: "One of the values is too long" };

  const supabase = await createClient();
  const talentId = await myTalentId(supabase, profile.id);
  if (!talentId) return { error: "No talent profile linked to your account" };

  const { error } = await supabase
    .from("talent_measurements")
    .upsert({ talent_id: talentId, ...parsed.data }, { onConflict: "talent_id" });
  if (error) return { error: "Could not save your measurements" };

  revalidatePath("/talent/portfolio");
  revalidatePath("/talent/overview");
  return { success: true };
}

// Talent blocks out dates they can't work.
export async function addOutDates(prevState, formData) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const parsed = z
    .object({
      start: z.string().regex(ISO, "Pick a start date"),
      end: z.string().regex(ISO, "Pick an end date"),
      reason: z.string().max(200, "Keep the note short").nullish(),
    })
    .safeParse({
      start: field(formData, "start") ?? "",
      end: field(formData, "end") ?? "",
      reason: field(formData, "reason"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let { start, end, reason } = parsed.data;
  if (end < start) [start, end] = [end, start];
  const today = new Date().toISOString().slice(0, 10);
  if (end < today) return { error: "Those dates have already passed" };

  const supabase = await createClient();
  const talentId = await myTalentId(supabase, profile.id);
  if (!talentId) return { error: "No talent profile linked to your account" };

  const { error } = await supabase.from("talent_unavailability").insert({
    talent_id: talentId,
    start_date: start,
    end_date: end,
    reason: reason ?? null,
  });
  if (error) return { error: "Could not save your out-dates" };

  revalidatePath("/talent/calendar");
  return { success: true };
}

export async function deleteOutDates(id) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { error: "Missing entry" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("talent_unavailability")
    .delete()
    .eq("id", parsed.data);
  if (error) return { error: "Could not remove the entry" };

  revalidatePath("/talent/calendar");
  return { success: true };
}
