"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TALENT_CATEGORIES = [
  "model", "photographer", "creative_director", "visual_artist", "artisan",
  "graphic_designer", "content_creator", "influencer", "brand_partner", "educator",
];
const TALENT_LOCATIONS = ["lagos", "london", "usa"];
const TALENT_STATUSES = ["active", "inactive", "suspended", "exited"];
const ASSET_STATUSES = ["current", "needs_update", "missing"];
const IMAGE_TYPES = ["polaroid", "comp_card", "digital", "editorial", "commercial", "test_shoot"];

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

// For optional columns: absent => undefined (leave unchanged on update),
// submitted empty => null (clear the column).
function clearableField(formData, name) {
  const v = formData.get(name);
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? null : s;
}

// No .default() here — defaults would fire through .partial() on updates and
// silently overwrite stored values. Creation relies on the DB column defaults.
const talentFieldsSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  category: z.enum(TALENT_CATEGORIES, { message: "Pick a category" }),
  primaryLocation: z.enum(TALENT_LOCATIONS, { message: "Pick a primary location" }),
  secondaryLocation: z.enum(TALENT_LOCATIONS).nullish(),
  exclusivity: z.enum(["exclusive", "non_exclusive"]).optional(),
  contractType: z.enum(["welcome_agreement", "full_management"]).optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  instagramHandle: z.string().max(100).nullish(),
  phone: z.string().max(50).nullish(),
  dateOfBirth: z.string().nullish(),
  bio: z.string().nullish(),
  contractStartDate: z.string().nullish(),
  contractEndDate: z.string().nullish(),
});

function readTalentFields(formData) {
  return {
    firstName: field(formData, "firstName"),
    lastName: field(formData, "lastName"),
    category: field(formData, "category"),
    primaryLocation: field(formData, "primaryLocation"),
    secondaryLocation: clearableField(formData, "secondaryLocation"),
    exclusivity: field(formData, "exclusivity"),
    contractType: field(formData, "contractType"),
    commissionRate: field(formData, "commissionRate"),
    instagramHandle: clearableField(formData, "instagramHandle"),
    phone: clearableField(formData, "phone"),
    dateOfBirth: clearableField(formData, "dateOfBirth"),
    bio: clearableField(formData, "bio"),
    contractStartDate: clearableField(formData, "contractStartDate"),
    contractEndDate: clearableField(formData, "contractEndDate"),
  };
}

function toTalentColumns(v) {
  const row = {
    first_name: v.firstName,
    last_name: v.lastName,
    category: v.category,
    primary_location: v.primaryLocation,
    secondary_location: v.secondaryLocation,
    exclusivity: v.exclusivity,
    contract_type: v.contractType,
    commission_rate: v.commissionRate,
    instagram_handle: v.instagramHandle,
    phone: v.phone,
    date_of_birth: v.dateOfBirth,
    bio: v.bio,
    contract_start_date: v.contractStartDate,
    contract_end_date: v.contractEndDate,
  };
  // Drop keys the caller didn't submit at all (partial updates).
  for (const key of Object.keys(row)) {
    if (row[key] === undefined) delete row[key];
  }
  return row;
}

// Creates the auth login + talent profile. Any admin role.
export async function createTalent(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = talentFieldsSchema
    .extend({ email: z.string().email("Enter a valid email address") })
    .safeParse({ ...readTalentFields(formData), email: field(formData, "email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  // Auth accounts can only be created with the service role key —
  // supabase.auth.admin is unavailable on the anon client. The role guard
  // above makes this safe.
  const admin = createAdminClient();
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: v.email,
    password: `Candor-${crypto.randomUUID()}`,
    email_confirm: true,
    user_metadata: { full_name: `${v.firstName} ${v.lastName}`, role: "talent" },
  });
  if (authError) {
    return { error: "Could not create the login — is this email already in use?" };
  }

  const supabase = await createClient();
  const { data: talent, error } = await supabase
    .from("talent_profiles")
    .insert({ ...toTalentColumns(v), user_id: created.user.id })
    .select("id")
    .single();
  if (error) {
    // Roll the orphaned auth user back so the email can be retried.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "Could not create the talent profile" };
  }

  revalidatePath("/admin/talent");
  return { success: true, talentId: talent.id };
}

// Partial update of profile/contract fields. Any admin role.
export async function updateTalent(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = talentFieldsSchema
    .partial()
    .extend({
      id: z.string().uuid("Missing talent id"),
      status: z.enum(TALENT_STATUSES).optional(),
      isPublic: z.stringbool().optional(),
    })
    .safeParse({
      ...readTalentFields(formData),
      id: field(formData, "id"),
      status: field(formData, "status"),
      isPublic: field(formData, "isPublic"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, status, isPublic, ...rest } = parsed.data;

  const row = toTalentColumns(rest);
  if (status !== undefined) row.status = status;
  if (isPublic !== undefined) row.is_public = isPublic;
  if (Object.keys(row).length === 0) return { error: "Nothing to update" };

  const supabase = await createClient();
  const { error } = await supabase.from("talent_profiles").update(row).eq("id", id);
  if (error) return { error: "Could not update the talent profile" };

  revalidatePath("/admin/talent");
  revalidatePath(`/admin/talent/${id}`);
  revalidatePath("/talent/portfolio");
  return { success: true };
}

// Upserts the 1:1 measurements row. Any admin role.
export async function updateMeasurements(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      talentId: z.string().uuid("Missing talent id"),
      heightCm: z.coerce.number().positive().optional(),
      heightDisplay: z.string().max(20).optional(),
      bust: z.string().max(10).optional(),
      waist: z.string().max(10).optional(),
      hips: z.string().max(10).optional(),
      shoeUk: z.string().max(10).optional(),
      shoeEu: z.string().max(10).optional(),
      hairColour: z.string().max(50).optional(),
      eyeColour: z.string().max(50).optional(),
      dressSize: z.string().max(20).optional(),
    })
    .safeParse({
      talentId: field(formData, "talentId"),
      heightCm: field(formData, "heightCm"),
      heightDisplay: field(formData, "heightDisplay"),
      bust: field(formData, "bust"),
      waist: field(formData, "waist"),
      hips: field(formData, "hips"),
      shoeUk: field(formData, "shoeUk"),
      shoeEu: field(formData, "shoeEu"),
      hairColour: field(formData, "hairColour"),
      eyeColour: field(formData, "eyeColour"),
      dressSize: field(formData, "dressSize"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("talent_measurements").upsert(
    {
      talent_id: v.talentId,
      height_cm: v.heightCm ?? null,
      height_display: v.heightDisplay ?? null,
      bust: v.bust ?? null,
      waist: v.waist ?? null,
      hips: v.hips ?? null,
      shoe_uk: v.shoeUk ?? null,
      shoe_eu: v.shoeEu ?? null,
      hair_colour: v.hairColour ?? null,
      eye_colour: v.eyeColour ?? null,
      dress_size: v.dressSize ?? null,
    },
    { onConflict: "talent_id" }
  );
  if (error) return { error: "Could not save measurements" };

  revalidatePath(`/admin/talent/${v.talentId}`);
  revalidatePath("/talent/portfolio");
  return { success: true };
}

// URL-based portfolio image add. Any admin role.
export async function addPortfolioImage(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      talentId: z.string().uuid("Missing talent id"),
      imageUrl: z.string().url("Enter a valid image URL").max(500),
      imageType: z.enum(IMAGE_TYPES, { message: "Pick an image type" }),
      isPrimaryPolaroid: z.stringbool().default(false),
      sortOrder: z.coerce.number().int().default(0),
    })
    .safeParse({
      talentId: field(formData, "talentId"),
      imageUrl: field(formData, "imageUrl"),
      imageType: field(formData, "imageType"),
      isPrimaryPolaroid: field(formData, "isPrimaryPolaroid"),
      sortOrder: field(formData, "sortOrder"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  if (v.isPrimaryPolaroid) {
    // Only one primary polaroid per talent.
    await supabase
      .from("talent_portfolio_images")
      .update({ is_primary_polaroid: false })
      .eq("talent_id", v.talentId)
      .eq("is_primary_polaroid", true);
  }
  const { error } = await supabase.from("talent_portfolio_images").insert({
    talent_id: v.talentId,
    image_url: v.imageUrl,
    image_type: v.imageType,
    is_primary_polaroid: v.isPrimaryPolaroid,
    sort_order: v.sortOrder,
    uploaded_by: profile.id,
  });
  if (error) return { error: "Could not add the image" };

  revalidatePath(`/admin/talent/${v.talentId}`);
  revalidatePath("/talent/portfolio");
  return { success: true };
}

export async function removePortfolioImage(imageId) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(imageId);
  if (!parsed.success) return { error: "Missing image id" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_portfolio_images")
    .delete()
    .eq("id", parsed.data)
    .select("talent_id");
  if (error) return { error: "Could not remove the image" };

  const talentId = data?.[0]?.talent_id;
  if (talentId) revalidatePath(`/admin/talent/${talentId}`);
  revalidatePath("/talent/portfolio");
  return { success: true };
}

// Updates the folded portfolio-status fields on talent_profiles. Any admin role.
export async function setPortfolioStatus(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      talentId: z.string().uuid("Missing talent id"),
      compCardStatus: z.enum(ASSET_STATUSES).optional(),
      digitalsStatus: z.enum(ASSET_STATUSES).optional(),
      lastTestShoot: z.string().nullish(),
      nextScheduledShoot: z.string().nullish(),
      portfolioNotes: z.string().nullish(),
    })
    .safeParse({
      talentId: field(formData, "talentId"),
      compCardStatus: field(formData, "compCardStatus"),
      digitalsStatus: field(formData, "digitalsStatus"),
      lastTestShoot: clearableField(formData, "lastTestShoot"),
      nextScheduledShoot: clearableField(formData, "nextScheduledShoot"),
      portfolioNotes: clearableField(formData, "portfolioNotes"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const row = {};
  if (v.compCardStatus !== undefined) row.comp_card_status = v.compCardStatus;
  if (v.digitalsStatus !== undefined) row.digitals_status = v.digitalsStatus;
  if (v.lastTestShoot !== undefined) row.last_test_shoot = v.lastTestShoot;
  if (v.nextScheduledShoot !== undefined) row.next_scheduled_shoot = v.nextScheduledShoot;
  if (v.portfolioNotes !== undefined) row.portfolio_notes = v.portfolioNotes;
  if (Object.keys(row).length === 0) return { error: "Nothing to update" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("talent_profiles")
    .update(row)
    .eq("id", v.talentId);
  if (error) return { error: "Could not update the portfolio status" };

  revalidatePath(`/admin/talent/${v.talentId}`);
  revalidatePath("/talent/portfolio");
  return { success: true };
}

// CEO only: marks the talent inactive and disables their login.
export async function deactivateTalent(talentId) {
  const profile = await guard("ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(talentId);
  if (!parsed.success) return { error: "Missing talent id" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_profiles")
    .update({ status: "inactive", is_public: false })
    .eq("id", parsed.data)
    .select("user_id")
    .maybeSingle();
  if (error || !data) return { error: "Could not deactivate this talent" };

  if (data.user_id) {
    // RLS allows md/ceo to update profiles; disables login via lib/auth checks.
    await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", data.user_id);
  }

  revalidatePath("/admin/talent");
  revalidatePath(`/admin/talent/${parsed.data}`);
  return { success: true };
}
