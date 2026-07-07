import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Public roster for candor-management.com. Reads the `public_roster` view,
// which only exposes talent marked is_public. Anon key + RLS keep this safe.
export async function GET(request) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const location = searchParams.get("location");

  let query = supabase.from("public_roster").select("*");
  if (category) query = query.eq("category", category);
  if (location) query = query.eq("primary_location", location);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "Roster is unavailable right now" },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { talent: data },
    {
      headers: {
        // Cache at the CDN for 5 minutes; roster changes are not urgent.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
