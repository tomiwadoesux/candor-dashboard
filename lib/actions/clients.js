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
// silently overwrite stored values; createClient_ resolves them explicitly.
const clientFieldsSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  contactPerson: z.string().max(255).nullish(),
  email: z.string().email("Enter a valid email address").nullish(),
  phone: z.string().max(50).nullish(),
  address: z.string().nullish(),
  clientType: z.enum(["new", "established"]).optional(),
  paymentTerms: z.string().max(100).nullish(),
  notes: z.string().nullish(),
});

function readClientFields(formData) {
  return {
    companyName: field(formData, "companyName"),
    contactPerson: clearableField(formData, "contactPerson"),
    email: clearableField(formData, "email"),
    phone: clearableField(formData, "phone"),
    address: clearableField(formData, "address"),
    clientType: field(formData, "clientType"),
    paymentTerms: clearableField(formData, "paymentTerms"),
    notes: clearableField(formData, "notes"),
  };
}

function toClientColumns(v) {
  const row = {
    company_name: v.companyName,
    contact_person: v.contactPerson,
    email: v.email,
    phone: v.phone,
    address: v.address,
    client_type: v.clientType,
    payment_terms: v.paymentTerms,
    notes: v.notes,
  };
  for (const key of Object.keys(row)) {
    if (row[key] === undefined) delete row[key];
  }
  return row;
}

// Trailing underscore avoids clashing with supabase's createClient import.
export async function createClient_(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = clientFieldsSchema.safeParse(readClientFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  v.clientType = v.clientType ?? "new";
  // Default payment terms derive from client type but stay overridable.
  if (!v.paymentTerms) {
    v.paymentTerms = v.clientType === "established" ? "Net 14" : "100% upfront";
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert(toClientColumns(v))
    .select("id")
    .single();
  if (error) return { error: "Could not create the client" };

  revalidatePath("/admin/clients");
  return { success: true, clientId: data.id };
}

export async function updateClient(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = clientFieldsSchema
    .partial()
    .extend({ id: z.string().uuid("Missing client id") })
    .safeParse({ ...readClientFields(formData), id: field(formData, "id") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...rest } = parsed.data;

  const row = toClientColumns(rest);
  if (Object.keys(row).length === 0) return { error: "Nothing to update" };

  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(row).eq("id", id);
  if (error) return { error: "Could not update the client" };

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  return { success: true };
}

export async function toggleClientActive(clientId, isActive) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({ clientId: z.string().uuid(), isActive: z.boolean() })
    .safeParse({ clientId, isActive });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.clientId);
  if (error) return { error: "Could not update the client" };

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  return { success: true };
}
