"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/format";

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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function revalidatePaymentPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/invoicing");
  revalidatePath("/talent/overview");
  revalidatePath("/talent/payments");
}

// Creates the payment for a booking, snapshotting the talent's commission
// rate and matching the DB CHECK constraints:
//   commission = round(gross * rate / 100, 2); net = gross - commission.
// md/ceo only (bookers cannot process payments).
export async function createPaymentForBooking(prevState, formData) {
  const profile = await guard("md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      bookingId: z.string().uuid("Pick a booking"),
      grossFee: z.coerce.number().positive().optional(), // defaults to booking.talent_fee
      invoiceNumber: z.string().max(50).optional(),
      notes: z.string().optional(),
    })
    .safeParse({
      bookingId: field(formData, "bookingId"),
      grossFee: field(formData, "grossFee"),
      invoiceNumber: field(formData, "invoiceNumber"),
      notes: field(formData, "notes"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select(
      "id, project_title, talent_id, talent_fee, fee_currency, talent:talent_profiles(commission_rate)"
    )
    .eq("id", v.bookingId)
    .maybeSingle();
  if (fetchError || !booking) return { error: "Booking not found" };

  const gross = v.grossFee ?? Number(booking.talent_fee);
  const rate = Number(booking.talent?.commission_rate ?? 20);
  // Same rounding as the payments_commission_math_chk constraint.
  const commission = Math.round(gross * rate) / 100;
  const net = Number((gross - commission).toFixed(2));

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      booking_id: booking.id,
      talent_id: booking.talent_id,
      gross_fee: gross,
      commission_rate: rate,
      commission_amount: commission,
      net_talent_payment: net,
      currency: booking.fee_currency,
      status: "awaiting_client_payment",
      invoice_number: v.invoiceNumber ?? null,
      notes: v.notes ?? null,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error) return { error: "Could not create the payment" };

  // FYI notification — payment_update never expects a response.
  await supabase.from("notifications").insert({
    talent_id: booking.talent_id,
    sender_id: profile.id,
    type: "payment_update",
    title: `Payment processing — ${booking.project_title}`,
    body: `A payment is being processed for "${booking.project_title}": gross ${money(gross, booking.fee_currency)}, net to you ${money(net, booking.fee_currency)} after ${rate}% commission.`,
    booking_id: booking.id,
    requires_response: false,
  });

  revalidatePaymentPages();
  return { success: true, paymentId: payment.id };
}

// Marks the client side settled. md/ceo only.
export async function markClientPaid(paymentId) {
  const profile = await guard("md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(paymentId);
  if (!parsed.success) return { error: "Missing payment id" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "client_paid", client_payment_date: todayISO() })
    .eq("id", parsed.data)
    .eq("status", "awaiting_client_payment");
  if (error) return { error: "Could not update the payment" };

  revalidatePaymentPages();
  return { success: true };
}

// Marks the talent payout complete and notifies the talent. md/ceo only.
export async function markTalentPaid(paymentId) {
  const profile = await guard("md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z.string().uuid().safeParse(paymentId);
  if (!parsed.success) return { error: "Missing payment id" };

  const supabase = await createClient();
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id, talent_id, net_talent_payment, currency, booking:bookings(id, project_title)")
    .eq("id", parsed.data)
    .maybeSingle();
  if (fetchError || !payment) return { error: "Payment not found" };

  const { error } = await supabase
    .from("payments")
    .update({ status: "talent_paid", talent_payment_date: todayISO() })
    .eq("id", payment.id);
  if (error) return { error: "Could not update the payment" };

  await supabase.from("notifications").insert({
    talent_id: payment.talent_id,
    sender_id: profile.id,
    type: "payment_update",
    title: `Payment received — ${payment.booking?.project_title ?? "your booking"}`,
    body: `${money(payment.net_talent_payment, payment.currency)} has been deposited for "${payment.booking?.project_title ?? "your booking"}".`,
    booking_id: payment.booking?.id ?? null,
    requires_response: false,
  });

  revalidatePaymentPages();
  return { success: true };
}

// md/ceo only (payments are md/ceo-writable under RLS).
export async function setInvoiceNumber(paymentId, invoiceNumber) {
  const profile = await guard("md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const parsed = z
    .object({
      paymentId: z.string().uuid(),
      invoiceNumber: z.string().min(1, "Enter an invoice number").max(50),
    })
    .safeParse({ paymentId, invoiceNumber });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ invoice_number: parsed.data.invoiceNumber })
    .eq("id", parsed.data.paymentId);
  if (error) return { error: "Could not save the invoice number" };

  revalidatePath("/admin/invoicing");
  return { success: true };
}
