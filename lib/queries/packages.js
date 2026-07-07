import "server-only";
import { createClient } from "@/lib/supabase/server";

// Admin list of client packages with view counts.
export async function listPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_packages")
    .select("id, title, client_name, note, talent_ids, token, expires_at, created_at, views:package_views(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load packages");
  return (data ?? []).map((p) => ({
    ...p,
    viewCount: p.views?.[0]?.count ?? 0,
    expired: p.expires_at ? new Date(p.expires_at) < new Date() : false,
  }));
}
