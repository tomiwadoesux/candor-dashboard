"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dateShort, money, statusLabel } from "@/lib/format";

const TALENT_CATEGORIES = [
  "model", "photographer", "creative_director", "visual_artist", "artisan",
  "graphic_designer", "content_creator", "influencer", "brand_partner", "educator",
];
const BOOKING_LOCATIONS = ["lagos", "london", "usa_other"];
const CURRENCIES = ["NGN", "GBP", "USD"];

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

async function myTalentId(supabase, userId) {
  const { data } = await supabase
    .from("talent_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

function revalidateCastingPages(castingId) {
  revalidatePath("/admin/casting");
  if (castingId) revalidatePath(`/admin/casting/${castingId}`);
  revalidatePath("/talent/castings");
  revalidatePath("/talent/overview");
}

// For optional columns: absent => undefined (leave unchanged on update),
// submitted empty => null (clear the column).
function clearableField(formData, name) {
  const v = formData.get(name);
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? null : s;
}

const castingFieldsSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().nullish(),
  category: z.enum(TALENT_CATEGORIES, { message: "Pick a category" }),
  location: z.enum(BOOKING_LOCATIONS, { message: "Pick a location" }),
  shootDateStart: z.string().min(1, "Shoot start date is required"),
  shootDateEnd: z.string().nullish(),
  workType: z.string().max(100).nullish(),
  mediaUsage: z.string().max(255).nullish(),
  requirements: z.string().nullish(),
  deadline: z.string().min(1, "Deadline is required"),
  // INTERNAL-only fields, never exposed to talent (see 002_rls.sql):
  clientId: z.string().uuid().nullish(),
  brandNameInternal: z.string().max(255).nullish(),
});

function readCastingFields(formData) {
  return {
    title: field(formData, "title"),
    description: clearableField(formData, "description"),
    category: field(formData, "category"),
    location: field(formData, "location"),
    shootDateStart: field(formData, "shootDateStart"),
    shootDateEnd: clearableField(formData, "shootDateEnd"),
    workType: clearableField(formData, "workType"),
    mediaUsage: clearableField(formData, "mediaUsage"),
    requirements: clearableField(formData, "requirements"),
    deadline: field(formData, "deadline"),
    clientId: clearableField(formData, "clientId"),
    brandNameInternal: clearableField(formData, "brandNameInternal"),
  };
}

function toCastingColumns(v) {
  const row = {
    title: v.title,
    description: v.description,
    category: v.category,
    location: v.location,
    shoot_date_start: v.shootDateStart,
    shoot_date_end: v.shootDateEnd,
    work_type: v.workType,
    media_usage: v.mediaUsage,
    requirements: v.requirements,
    deadline: v.deadline,
    client_id: v.clientId,
    brand_name_internal: v.brandNameInternal,
  };
  for (const key of Object.keys(row)) {
    if (row[key] === undefined) delete row[key];
  }
  return row;
}

// Any admin role.
export async function createCasting(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = castingFieldsSchema.safeParse(readCastingFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("open_castings")
    .insert({ ...toCastingColumns(parsed.data), status: "open", created_by: profile.id })
    .select("id")
    .single();
  if (error) return { error: "Could not create the casting" };

  revalidateCastingPages(data.id);
  return { success: true, castingId: data.id };
}

export async function updateCasting(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = castingFieldsSchema
    .partial()
    .extend({ id: z.string().uuid("Missing casting id") })
    .safeParse({ ...readCastingFields(formData), id: field(formData, "id") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...rest } = parsed.data;

  const row = toCastingColumns(rest);
  if (Object.keys(row).length === 0) return { error: "Nothing to update" };

  const supabase = await createClient();
  const { error } = await supabase.from("open_castings").update(row).eq("id", id);
  if (error) return { error: "Could not update the casting" };

  revalidateCastingPages(id);
  return { success: true };
}

export async function closeCasting(castingId) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(castingId);
  if (!parsed.success) return { error: "Missing casting id" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("open_castings")
    .update({ status: "closed" })
    .eq("id", parsed.data);
  if (error) return { error: "Could not close the casting" };

  revalidateCastingPages(parsed.data);
  return { success: true };
}

// Talent responds to an open casting: "interested" | "not_available".
// Auto-detects calendar conflicts against the talent's pending/confirmed
// bookings. Upserts, so a talent can change their mind until shortlisted.
export async function expressInterest(castingId, response) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      castingId: z.string().uuid(),
      response: z.enum(["interested", "not_available"]),
    })
    .safeParse({ castingId, response });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const talentId = await myTalentId(supabase, profile.id);
  if (!talentId) return { error: "No talent profile linked to your account" };

  // Talent read the sanitized view — closed castings vanish from it.
  const { data: casting } = await supabase
    .from("open_castings_public")
    .select("id, shoot_date_start, shoot_date_end, deadline")
    .eq("id", parsed.data.castingId)
    .maybeSingle();
  if (!casting) return { error: "This casting is no longer open" };
  if (new Date(casting.deadline) < new Date()) {
    return { error: "The deadline for this casting has passed" };
  }

  // Calendar-conflict auto-detection (own bookings only, via RLS).
  let calendarConflict = false;
  let conflictDetails = null;
  if (parsed.data.response === "interested") {
    const shootEnd = casting.shoot_date_end ?? casting.shoot_date_start;
    const { data: overlapping } = await supabase
      .from("bookings")
      .select("id, project_title, booking_date, booking_end_date, status")
      .in("status", ["pending", "confirmed"])
      .lte("booking_date", shootEnd);
    const clash = (overlapping ?? []).find(
      (b) => (b.booking_end_date ?? b.booking_date) >= casting.shoot_date_start
    );
    if (clash) {
      calendarConflict = true;
      // conflict_details is varchar(255)
      conflictDetails = `Overlaps "${clash.project_title}" (${dateShort(clash.booking_date)})`.slice(0, 255);
    }
  }

  const { error } = await supabase.from("casting_interests").upsert(
    {
      casting_id: casting.id,
      talent_id: talentId,
      response: parsed.data.response,
      calendar_conflict: calendarConflict,
      conflict_details: conflictDetails,
    },
    { onConflict: "casting_id,talent_id" }
  );
  if (error) {
    // RLS freezes the row once an admin has shortlisted/selected the talent.
    return { error: "Could not save your response — it may be locked by Candor" };
  }

  revalidateCastingPages(casting.id);
  return { success: true, calendarConflict };
}

// Talent withdraws a previous "interested" (flips it to not_available —
// talent cannot delete interest rows under RLS).
export async function withdrawInterest(castingId) {
  const profile = await guard("talent");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(castingId);
  if (!parsed.success) return { error: "Missing casting id" };

  const supabase = await createClient();
  const talentId = await myTalentId(supabase, profile.id);
  if (!talentId) return { error: "No talent profile linked to your account" };

  const { data, error } = await supabase
    .from("casting_interests")
    .update({ response: "not_available", calendar_conflict: false, conflict_details: null })
    .eq("casting_id", parsed.data)
    .eq("talent_id", talentId)
    .select("id");
  if (error) return { error: "Could not withdraw — your response may be locked by Candor" };
  if (!data?.length) return { error: "You haven't responded to this casting" };

  revalidateCastingPages(parsed.data);
  return { success: true };
}

// Admin: toggle shortlist on an interest row.
export async function shortlistInterest(interestId, shortlisted = true) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({ interestId: z.string().uuid(), shortlisted: z.boolean() })
    .safeParse({ interestId, shortlisted });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("casting_interests")
    .update({ shortlisted: parsed.data.shortlisted })
    .eq("id", parsed.data.interestId)
    .select("casting_id")
    .maybeSingle();
  if (error || !data) return { error: "Could not update the shortlist" };

  revalidateCastingPages(data.casting_id);
  return { success: true };
}

// Admin: select a talent — reveals the brand to them via a private notification.
export async function selectInterest(interestId) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(interestId);
  if (!parsed.success) return { error: "Missing interest id" };

  const supabase = await createClient();
  const { data: interest, error: fetchError } = await supabase
    .from("casting_interests")
    .select("id, talent_id, casting:open_castings(id, title, brand_name_internal)")
    .eq("id", parsed.data)
    .maybeSingle();
  if (fetchError || !interest) return { error: "Interest not found" };

  const { error } = await supabase
    .from("casting_interests")
    .update({ selected: true, shortlisted: true })
    .eq("id", interest.id);
  if (error) return { error: "Could not select this talent" };

  const brand = interest.casting?.brand_name_internal;
  await supabase.from("notifications").insert({
    talent_id: interest.talent_id,
    sender_id: profile.id,
    type: "general",
    title: `You've been selected — ${interest.casting?.title ?? "casting"}`,
    body: `Great news — you have been selected for "${interest.casting?.title ?? "a casting"}".${brand ? ` The client is ${brand}.` : ""} Your booker will follow up with the details.`,
    requires_response: false,
  });

  revalidateCastingPages(interest.casting?.id);
  revalidatePath("/talent/communications");
  return { success: true };
}

// Admin: creates a booking from a casting for the chosen talent, carrying the
// casting details over. The casting must be linked to a client (bookings
// require one) unless a clientId is passed explicitly.
export async function convertCastingToBooking(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      castingId: z.string().uuid("Missing casting id"),
      talentId: z.string().uuid("Pick a talent"),
      talentFee: z.coerce.number().positive("Enter the talent fee"),
      feeCurrency: z.enum(CURRENCIES).default("NGN"),
      clientId: z.string().uuid().optional(),
      status: z.enum(["pending", "confirmed"]).default("confirmed"),
    })
    .safeParse({
      castingId: field(formData, "castingId"),
      talentId: field(formData, "talentId"),
      talentFee: field(formData, "talentFee"),
      feeCurrency: field(formData, "feeCurrency"),
      clientId: field(formData, "clientId"),
      status: field(formData, "status"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  const { data: casting, error: fetchError } = await supabase
    .from("open_castings")
    .select("id, title, description, location, shoot_date_start, shoot_date_end, work_type, media_usage, client_id")
    .eq("id", v.castingId)
    .maybeSingle();
  if (fetchError || !casting) return { error: "Casting not found" };

  const clientId = v.clientId ?? casting.client_id;
  if (!clientId) {
    return { error: "Link a client to this casting before converting it" };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      talent_id: v.talentId,
      client_id: clientId,
      project_title: casting.title,
      service_type: casting.work_type,
      status: v.status,
      booking_date: casting.shoot_date_start,
      booking_end_date: casting.shoot_date_end,
      location_city: casting.location,
      talent_fee: v.talentFee,
      fee_currency: v.feeCurrency,
      media_usage: casting.media_usage,
      notes: `Created from casting "${casting.title}"`,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error) return { error: "Could not create the booking" };

  await supabase.from("booking_status_history").insert({
    booking_id: booking.id,
    old_status: null,
    new_status: v.status,
    changed_by: profile.id,
  });
  await supabase.from("notifications").insert({
    talent_id: v.talentId,
    sender_id: profile.id,
    type: "booking_update",
    title: `New booking — ${casting.title}`,
    body: `Your casting selection is now a ${statusLabel(v.status).toLowerCase()} booking: ${casting.title} on ${dateShort(casting.shoot_date_start)} (${statusLabel(casting.location)}). Fee: ${money(v.talentFee, v.feeCurrency)}.`,
    booking_id: booking.id,
    requires_response: true,
  });

  revalidateCastingPages(casting.id);
  revalidatePath("/admin/bookings");
  revalidatePath("/talent/bookings");
  return { success: true, bookingId: booking.id };
}
