import "server-only";
import { createClient } from "@/lib/supabase/server";

// Admin-only (RLS: talent get zero rows on clients).
export async function listClients({ q, type } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select(
      "id, company_name, contact_person, email, phone, client_type, payment_terms, is_active, created_at, bookings(count)"
    )
    .order("company_name", { ascending: true });

  if (type) query = query.eq("client_type", type);
  if (q) {
    const term = q.replace(/[,()%]/g, " ").trim();
    if (term) query = query.ilike("company_name", `%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load clients");
  return (data ?? []).map(({ bookings, ...client }) => ({
    ...client,
    bookingsCount: bookings?.[0]?.count ?? 0,
  }));
}

// Client detail with booking history and payment totals per currency.
export async function getClientById(id) {
  const supabase = await createClient();
  const [clientRes, paymentsRes] = await Promise.all([
    supabase
      .from("clients")
      .select(
        `*,
         bookings(id, project_title, service_type, status, booking_date, talent_fee, fee_currency, talent:talent_profiles(id, first_name, last_name))`
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("payments")
      .select(
        "id, gross_fee, commission_amount, net_talent_payment, currency, status, booking:bookings!inner(id, project_title, client_id)"
      )
      .eq("booking.client_id", id),
  ]);

  if (clientRes.error) throw new Error("Could not load this client");
  if (!clientRes.data) return null;

  const payments = paymentsRes.error ? [] : (paymentsRes.data ?? []);
  // paymentTotals: { NGN: { gross, commission, net, outstanding }, ... }
  const paymentTotals = {};
  for (const p of payments) {
    const t = (paymentTotals[p.currency] ??= {
      gross: 0,
      commission: 0,
      net: 0,
      outstanding: 0,
    });
    t.gross += Number(p.gross_fee);
    t.commission += Number(p.commission_amount);
    t.net += Number(p.net_talent_payment);
    if (p.status === "awaiting_client_payment") t.outstanding += Number(p.gross_fee);
  }

  const { bookings, ...client } = clientRes.data;
  return {
    ...client,
    bookings: (bookings ?? []).sort((a, b) =>
      a.booking_date < b.booking_date ? 1 : -1
    ),
    payments,
    paymentTotals,
  };
}
