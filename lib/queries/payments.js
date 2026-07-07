import "server-only";
import { createClient } from "@/lib/supabase/server";

function startOfYearISO() {
  return `${new Date().getFullYear()}-01-01`;
}

function addTo(totals, currency, amount) {
  totals[currency] = (totals[currency] ?? 0) + Number(amount);
}

// Admin payments table (talent would only see their own rows via RLS, but the
// nested client embed is admin-only — talent pages should use myPayments).
export async function listPayments({ status, talentId } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("payments")
    .select(
      `id, gross_fee, commission_rate, commission_amount, net_talent_payment, currency,
       status, client_payment_date, talent_payment_date, invoice_number, notes, created_at,
       booking:bookings(id, project_title, booking_date, client:clients(id, company_name)),
       talent:talent_profiles(id, first_name, last_name)`
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (talentId) query = query.eq("talent_id", talentId);

  const { data, error } = await query;
  if (error) throw new Error("Could not load payments");
  return data;
}

// Talent payment history: own payments with the booking title/date.
export async function myPayments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      `id, gross_fee, commission_rate, commission_amount, net_talent_payment, currency,
       status, client_payment_date, talent_payment_date, invoice_number, created_at,
       booking:bookings(id, project_title, booking_date)`
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your payments");
  return (data ?? []).sort((a, b) => {
    const da = a.booking?.booking_date ?? "";
    const db = b.booking?.booking_date ?? "";
    return da < db ? 1 : -1;
  });
}

// Admin finance overview. Buckets keyed by status; per-currency totals.
// Returns:
// {
//   awaiting:   { count, totals: { NGN: { gross, net }, ... } },
//   clientPaid: { count, totals },   // client paid, talent payout pending
//   talentPaid: { count, totals },
//   ytdRevenue:    { NGN: n, ... },  // gross_fee of payments created this year
//   ytdCommission: { NGN: n, ... },  // commission_amount, same window
// }
export async function paymentSummary() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("gross_fee, commission_amount, net_talent_payment, currency, status, created_at");
  if (error) throw new Error("Could not load the payment summary");

  const bucket = () => ({ count: 0, totals: {} });
  const summary = {
    awaiting: bucket(),
    clientPaid: bucket(),
    talentPaid: bucket(),
    ytdRevenue: {},
    ytdCommission: {},
  };
  const yearStart = startOfYearISO();

  for (const p of data ?? []) {
    const b =
      p.status === "awaiting_client_payment"
        ? summary.awaiting
        : p.status === "client_paid"
          ? summary.clientPaid
          : summary.talentPaid;
    b.count += 1;
    const t = (b.totals[p.currency] ??= { gross: 0, net: 0 });
    t.gross += Number(p.gross_fee);
    t.net += Number(p.net_talent_payment);

    if (p.created_at >= yearStart) {
      addTo(summary.ytdRevenue, p.currency, p.gross_fee);
      addTo(summary.ytdCommission, p.currency, p.commission_amount);
    }
  }
  return summary;
}

// Talent finance summary (own rows via RLS). Returns:
// {
//   earnedYtdGross: { NGN: n, ... },  // gross_fee of payments created this year
//   paidYtdNet:     { NGN: n, ... },  // net received (talent_paid) this year
//   pendingNet:     { NGN: n, ... },  // net not yet paid out (awaiting/client_paid)
//   nextExpected: { id, net_talent_payment, currency, status,
//                   booking: { id, project_title, booking_date } } | null
// }
export async function talentPaymentSummary() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      `id, gross_fee, net_talent_payment, currency, status, created_at, talent_payment_date,
       booking:bookings(id, project_title, booking_date)`
    );
  if (error) throw new Error("Could not load your payment summary");

  const yearStart = startOfYearISO();
  const summary = {
    earnedYtdGross: {},
    paidYtdNet: {},
    pendingNet: {},
    nextExpected: null,
  };

  const pending = [];
  for (const p of data ?? []) {
    if (p.created_at >= yearStart) {
      addTo(summary.earnedYtdGross, p.currency, p.gross_fee);
    }
    if (p.status === "talent_paid") {
      if ((p.talent_payment_date ?? p.created_at) >= yearStart) {
        addTo(summary.paidYtdNet, p.currency, p.net_talent_payment);
      }
    } else {
      addTo(summary.pendingNet, p.currency, p.net_talent_payment);
      pending.push(p);
    }
  }

  pending.sort((a, b) => {
    const da = a.booking?.booking_date ?? "9999";
    const db = b.booking?.booking_date ?? "9999";
    return da < db ? -1 : 1;
  });
  const next = pending[0];
  if (next) {
    summary.nextExpected = {
      id: next.id,
      net_talent_payment: next.net_talent_payment,
      currency: next.currency,
      status: next.status,
      booking: next.booking ?? null,
    };
  }
  return summary;
}
