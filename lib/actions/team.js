"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

// Creates an admin login. Permission matrix: MD may create bookers;
// CEO may create bookers and MDs. Nobody creates CEOs here.
export async function createAdminAccount(prevState, formData) {
  const profile = await guard("md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      fullName: z.string().min(1, "Name is required").max(255),
      email: z.string().email("Enter a valid email address"),
      role: z.enum(["booker", "md"], { message: "Pick a role" }),
    })
    .safeParse({
      fullName: field(formData, "fullName"),
      email: field(formData, "email"),
      role: field(formData, "role"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  if (profile.role === "md" && v.role !== "booker") {
    return { error: "MDs can only create booker accounts" };
  }

  // Auth accounts require the service role key (auth.admin API); the profiles
  // row is then created by the on_auth_user_created trigger from the metadata.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: v.email,
    password: `Candor-${crypto.randomUUID()}`,
    email_confirm: true,
    user_metadata: { full_name: v.fullName, role: v.role },
  });
  if (error) {
    return { error: "Could not create the account — is this email already in use?" };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

// CEO only: enable/disable an admin login (lib/auth blocks inactive profiles).
export async function toggleAdminActive(profileId, isActive) {
  const profile = await guard("ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({ profileId: z.string().uuid(), isActive: z.boolean() })
    .safeParse({ profileId, isActive });
  if (!parsed.success) return { error: "Invalid input" };
  if (parsed.data.profileId === profile.id) {
    return { error: "You cannot deactivate your own account" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.profileId);
  if (error) return { error: "Could not update the account" };

  revalidatePath("/admin/settings");
  return { success: true };
}

// md/ceo only (RLS: profiles updates are md/ceo).
export async function updateProfileName(profileId, fullName) {
  const profile = await guard("md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      profileId: z.string().uuid(),
      fullName: z.string().min(1, "Name is required").max(255),
    })
    .safeParse({ profileId, fullName });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", parsed.data.profileId);
  if (error) return { error: "Could not update the name" };

  revalidatePath("/admin/settings");
  return { success: true };
}
