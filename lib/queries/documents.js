import "server-only";
import { createClient } from "@/lib/supabase/server";

// Spec grouping for the talent documents page.
const DOCUMENT_GROUPS = {
  management_agreement: "agreements",
  welcome_agreement: "agreements",
  nda: "agreements",
  code_of_conduct: "agreements",
  booking_confirmation: "bookings",
  call_sheet: "bookings",
  payment_statement: "financial",
  social_media_policy: "policies",
  data_privacy_policy: "policies",
  other: "other",
};

// Admin document list across talent.
export async function listDocuments({ talentId, type } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("documents")
    .select(
      `id, title, document_type, file_url, is_personalised, date_signed, created_at,
       talent:talent_profiles(id, first_name, last_name),
       booking:bookings(id, project_title),
       uploaded_by:profiles(id, full_name)`
    )
    .order("created_at", { ascending: false });

  if (talentId) query = query.eq("talent_id", talentId);
  if (type) query = query.eq("document_type", type);

  const { data, error } = await query;
  if (error) throw new Error("Could not load documents");
  return data;
}

// Talent view: own documents (RLS-scoped), grouped by spec category.
// Returns { agreements: [], bookings: [], financial: [], policies: [], other: [] };
// each group is ordered newest first.
export async function myDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, title, document_type, file_url, is_personalised, date_signed, booking_id, created_at"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your documents");

  const grouped = {
    agreements: [],
    bookings: [],
    financial: [],
    policies: [],
    other: [],
  };
  for (const doc of data ?? []) {
    (grouped[DOCUMENT_GROUPS[doc.document_type]] ?? grouped.other).push(doc);
  }
  return grouped;
}
