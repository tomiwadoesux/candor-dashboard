import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_ROLES = ["booker", "md", "ceo"];
export const FINANCE_ROLES = ["md", "ceo"];

// Deduped per request. Uses getUser() (validates the JWT with Supabase) rather
// than trusting the cookie payload.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

// The user's profile row (role, name, active flag). Null when signed out.
export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .single();
  return data ?? null;
});

// Route-level guard for pages/layouts. Redirects instead of throwing.
export async function requireRole(...roles) {
  const profile = await getProfile();
  if (!profile || !profile.is_active) redirect("/login");
  if (!roles.includes(profile.role)) {
    redirect(profile.role === "talent" ? "/talent/overview" : "/admin");
  }
  return profile;
}

// Action-level guard. Server actions must not redirect blindly — they throw so
// the caller surfaces a proper error state.
export async function assertRole(...roles) {
  const profile = await getProfile();
  if (!profile || !profile.is_active || !roles.includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return profile;
}

export function homeFor(role) {
  return role === "talent" ? "/talent/overview" : "/admin";
}
