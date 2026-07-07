"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { money, dateShort, statusLabel } from "@/lib/format";

const BOOKING_STATUSES = ["casting_sent", "pending", "confirmed", "completed", "cancelled"];
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

function revalidateBookingPages(bookingId) {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  if (bookingId) revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/talent/overview");
  revalidatePath("/talent/bookings");
  revalidatePath("/talent/calendar");
  revalidatePath("/talent/communications");
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
// silently overwrite stored values; createBooking resolves them explicitly.
const bookingFieldsSchema = z.object({
  talentId: z.string().uuid("Pick a talent"),
  clientId: z.string().uuid("Pick a client"),
  projectTitle: z.string().min(1, "Project title is required").max(255),
  serviceType: z.string().max(100).nullish(),
  status: z.enum(BOOKING_STATUSES).optional(),
  bookingDate: z.string().min(1, "Booking date is required"),
  bookingEndDate: z.string().nullish(),
  callTime: z.string().nullish(),
  locationCity: z.enum(BOOKING_LOCATIONS, { message: "Pick a location" }),
  locationAddress: z.string().nullish(),
  durationDescription: z.string().max(100).nullish(),
  talentFee: z.coerce.number().positive("Enter the talent fee"),
  feeCurrency: z.enum(CURRENCIES).optional(),
  totalClientFee: z.coerce.number().positive().nullish(),
  overtimeRate: z.string().max(100).optional(),
  mediaUsage: z.string().max(255).nullish(),
  territory: z.string().max(255).nullish(),
  usageTerm: z.string().max(100).nullish(),
  notes: z.string().nullish(),
});

function readBookingFields(formData) {
  return {
    talentId: field(formData, "talentId"),
    clientId: field(formData, "clientId"),
    projectTitle: field(formData, "projectTitle"),
    serviceType: clearableField(formData, "serviceType"),
    status: field(formData, "status"),
    bookingDate: field(formData, "bookingDate"),
    bookingEndDate: clearableField(formData, "bookingEndDate"),
    callTime: clearableField(formData, "callTime"),
    locationCity: field(formData, "locationCity"),
    locationAddress: clearableField(formData, "locationAddress"),
    durationDescription: clearableField(formData, "durationDescription"),
    talentFee: field(formData, "talentFee"),
    feeCurrency: field(formData, "feeCurrency"),
    totalClientFee: clearableField(formData, "totalClientFee"),
    overtimeRate: field(formData, "overtimeRate"),
    mediaUsage: clearableField(formData, "mediaUsage"),
    territory: clearableField(formData, "territory"),
    usageTerm: clearableField(formData, "usageTerm"),
    notes: clearableField(formData, "notes"),
  };
}

function toBookingColumns(v) {
  const row = {
    talent_id: v.talentId,
    client_id: v.clientId,
    project_title: v.projectTitle,
    service_type: v.serviceType,
    booking_date: v.bookingDate,
    booking_end_date: v.bookingEndDate,
    call_time: v.callTime,
    location_city: v.locationCity,
    location_address: v.locationAddress,
    duration_description: v.durationDescription,
    talent_fee: v.talentFee,
    fee_currency: v.feeCurrency,
    total_client_fee: v.totalClientFee,
    overtime_rate: v.overtimeRate,
    media_usage: v.mediaUsage,
    territory: v.territory,
    usage_term: v.usageTerm,
    notes: v.notes,
  };
  for (const key of Object.keys(row)) {
    if (row[key] === undefined) delete row[key];
  }
  return row;
}

// Creates the booking + initial status-history row + booking_update
// notification to the talent (Accept / Query). Any admin role.
export async function createBooking(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = bookingFieldsSchema.safeParse(readBookingFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const status = v.status ?? "pending";
  const currency = v.feeCurrency ?? "NGN";

  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      ...toBookingColumns(v),
      status,
      fee_currency: currency,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error) return { error: "Could not create the booking" };

  // Audit trail + talent notification. Secondary writes — the booking is the
  // source of truth, so failures here don't fail the action.
  await supabase.from("booking_status_history").insert({
    booking_id: booking.id,
    old_status: null,
    new_status: status,
    changed_by: profile.id,
  });
  await supabase.from("notifications").insert({
    talent_id: v.talentId,
    sender_id: profile.id,
    type: "booking_update",
    title: `New booking — ${v.projectTitle}`,
    body: `You have a new ${statusLabel(status).toLowerCase()} booking: ${v.projectTitle} on ${dateShort(v.bookingDate)} (${statusLabel(v.locationCity)}). Fee: ${money(v.talentFee, currency)}. Open your bookings for full details.`,
    booking_id: booking.id,
    requires_response: true,
  });

  revalidateBookingPages(booking.id);
  return { success: true, bookingId: booking.id };
}

// Edits booking fields (NOT status — use changeBookingStatus). Any admin role.
export async function updateBooking(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = bookingFieldsSchema
    .partial()
    .omit({ status: true })
    .extend({ id: z.string().uuid("Missing booking id") })
    .safeParse({ ...readBookingFields(formData), id: field(formData, "id") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...rest } = parsed.data;

  const row = toBookingColumns(rest);
  if (Object.keys(row).length === 0) return { error: "Nothing to update" };

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update(row).eq("id", id);
  if (error) return { error: "Could not update the booking" };

  revalidateBookingPages(id);
  return { success: true };
}

// Status transition: updates the booking, writes booking_status_history, and
// notifies the talent. Any admin role.
export async function changeBookingStatus(bookingId, newStatus) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({ bookingId: z.string().uuid(), newStatus: z.enum(BOOKING_STATUSES) })
    .safeParse({ bookingId, newStatus });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, project_title, talent_id")
    .eq("id", parsed.data.bookingId)
    .maybeSingle();
  if (fetchError || !booking) return { error: "Booking not found" };
  if (booking.status === parsed.data.newStatus) {
    return { error: `Booking is already ${statusLabel(booking.status).toLowerCase()}` };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.newStatus })
    .eq("id", booking.id);
  if (error) return { error: "Could not update the booking status" };

  await supabase.from("booking_status_history").insert({
    booking_id: booking.id,
    old_status: booking.status,
    new_status: parsed.data.newStatus,
    changed_by: profile.id,
  });

  const titles = {
    confirmed: `Your booking has been confirmed — ${booking.project_title}`,
    cancelled: `Booking cancelled — ${booking.project_title}`,
    completed: `Booking completed — ${booking.project_title}`,
  };
  await supabase.from("notifications").insert({
    talent_id: booking.talent_id,
    sender_id: profile.id,
    type: "booking_update",
    title: titles[parsed.data.newStatus] ?? `Booking update — ${booking.project_title}`,
    body: `The status of "${booking.project_title}" changed from ${statusLabel(booking.status).toLowerCase()} to ${statusLabel(parsed.data.newStatus).toLowerCase()}.`,
    booking_id: booking.id,
    // Confirmations expect an Accept/Query response; other transitions are FYI.
    requires_response: parsed.data.newStatus === "confirmed",
  });

  revalidateBookingPages(booking.id);
  return { success: true };
}

// Toggles the brief/call-sheet sent flags. flags: { preJobBriefSent?, callSheetSent? }.
export async function toggleBookingFlags(bookingId, flags) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      bookingId: z.string().uuid(),
      preJobBriefSent: z.boolean().optional(),
      callSheetSent: z.boolean().optional(),
    })
    .safeParse({ bookingId, ...flags });
  if (!parsed.success) return { error: "Invalid input" };

  const row = {};
  if (parsed.data.preJobBriefSent !== undefined) {
    row.pre_job_brief_sent = parsed.data.preJobBriefSent;
  }
  if (parsed.data.callSheetSent !== undefined) {
    row.call_sheet_sent = parsed.data.callSheetSent;
  }
  if (Object.keys(row).length === 0) return { error: "Nothing to update" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update(row)
    .eq("id", parsed.data.bookingId);
  if (error) return { error: "Could not update the booking" };

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${parsed.data.bookingId}`);
  return { success: true };
}
