"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertRole, ADMIN_ROLES } from "@/lib/auth";

const packageSchema = z.object({
  title: z.string().min(2, "Give the package a title"),
  clientName: z.string().optional(),
  note: z.string().optional(),
  expiryDays: z.coerce.number().int().min(0).max(365).optional(),
});

export async function createPackage(prevState, formData) {
  let profile;
  try {
    profile = await assertRole(...ADMIN_ROLES);
  } catch {
    return { error: "Not authorized" };
  }

  const parsed = packageSchema.safeParse({
    title: formData.get("title"),
    clientName: formData.get("clientName") || undefined,
    note: formData.get("note") || undefined,
    expiryDays: formData.get("expiryDays") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const talentIds = formData.getAll("talentIds").filter(Boolean);
  if (talentIds.length === 0) {
    return { error: "Select at least one talent for the package" };
  }

  const expiresAt =
    parsed.data.expiryDays && parsed.data.expiryDays > 0
      ? new Date(Date.now() + parsed.data.expiryDays * 86400000).toISOString()
      : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_packages")
    .insert({
      title: parsed.data.title,
      client_name: parsed.data.clientName ?? null,
      note: parsed.data.note ?? null,
      talent_ids: talentIds,
      token: randomBytes(24).toString("base64url"),
      expires_at: expiresAt,
      created_by: profile.id,
    })
    .select("id, token")
    .single();

  if (error) {
    return { error: "Could not create the package" };
  }

  revalidatePath("/admin/tools/packages");
  return { success: true, packageId: data.id, token: data.token };
}

export async function expirePackage(packageId) {
  try {
    await assertRole(...ADMIN_ROLES);
  } catch {
    return { error: "Not authorized" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("talent_packages")
    .update({ expires_at: new Date().toISOString() })
    .eq("id", packageId);
  if (error) return { error: "Could not expire the package" };
  revalidatePath("/admin/tools/packages");
  return { success: true };
}

export async function deletePackage(packageId) {
  try {
    await assertRole("md", "ceo");
  } catch {
    return { error: "Only MD or CEO can delete packages" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("talent_packages")
    .delete()
    .eq("id", packageId);
  if (error) return { error: "Could not delete the package" };
  revalidatePath("/admin/tools/packages");
  return { success: true };
}
