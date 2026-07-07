import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

function one(embed) {
  // Normalizes a PostgREST embed that may come back as object or single-row array.
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

function embedCount(embed) {
  return one(embed)?.count ?? 0;
}

// Admin roster list. RLS: admins see all rows; talent would only see their own.
export async function listTalent({ q, category, status } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("talent_profiles")
    .select(
      "id, first_name, last_name, category, status, exclusivity, primary_location, secondary_location, instagram_handle, polaroid_url, contract_start_date, contract_end_date, contract_type, commission_rate, is_public, comp_card_status, digitals_status, created_at"
    )
    .order("first_name", { ascending: true });

  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[,()%]/g, " ").trim();
    if (term) {
      query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load the talent roster");
  return data;
}

// Admin talent detail: full profile + measurements + portfolio images +
// linked account + bookings/payments/documents counts.
export async function getTalentById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_profiles")
    .select(
      `*,
       measurements:talent_measurements(*),
       portfolio_images:talent_portfolio_images(id, image_url, image_type, is_primary_polaroid, sort_order, created_at),
       account:profiles(id, email, full_name, is_active, last_login),
       bookings(count),
       payments(count),
       documents(count)`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Could not load this talent profile");
  if (!data) return null;

  const {
    measurements,
    portfolio_images: portfolioImages,
    account,
    bookings,
    payments,
    documents,
    ...profile
  } = data;

  return {
    ...profile,
    measurements: one(measurements),
    account: one(account),
    portfolioImages: (portfolioImages ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
    counts: {
      bookings: embedCount(bookings),
      payments: embedCount(payments),
      documents: embedCount(documents),
    },
  };
}

// The signed-in talent's own profile (+ measurements + portfolio images).
// Cached per request — every talent page needs it. Null when the user is not
// a talent (or has no linked talent_profiles row).
export const getMyTalentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("talent_profiles")
    .select(
      `*,
       measurements:talent_measurements(*),
       portfolio_images:talent_portfolio_images(id, image_url, image_type, is_primary_polaroid, sort_order, created_at)`
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Could not load your profile");
  if (!data) return null;

  const { measurements, portfolio_images: portfolioImages, ...profile } = data;
  return {
    ...profile,
    measurements: one(measurements),
    portfolioImages: (portfolioImages ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  };
});

// Casting engagement per talent, all rows. md/ceo only — the view itself
// returns zero rows for anyone else.
export async function listCastingAnalytics() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("casting_analytics_view")
    .select("*")
    .order("interests_count", { ascending: false });
  if (error) throw new Error("Could not load casting analytics");
  return data;
}

// Casting engagement for one talent (md/ceo only; null otherwise).
export async function getCastingAnalyticsForTalent(talentId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("casting_analytics_view")
    .select("*")
    .eq("talent_id", talentId)
    .maybeSingle();
  if (error) throw new Error("Could not load casting analytics");
  return data ?? null;
}
