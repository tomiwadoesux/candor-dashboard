import "server-only";
import { createClient } from "@/lib/supabase/server";
import { myNotifications } from "@/lib/queries/notifications";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysISO(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function addTo(totals, currency, amount) {
  totals[currency] = (totals[currency] ?? 0) + Number(amount);
}

// Admin home metrics. Returns:
// {
//   activeTalentCount, bookingsThisMonth,
//   revenueYtd: { NGN: n, ... },          // payments.gross_fee created this year
//   pendingPaymentsNet: { NGN: n, ... },  // net not yet paid to talent
//   escalatedCount,                       // escalated & still unanswered
//   expiringContracts: [{ id, first_name, last_name, contract_end_date }],   // <= 60d
//   castingDeadlines: [{ id, title, deadline, status }],                     // <= 7d
//   recentActivity: [{ id, old_status, new_status, created_at,
//                      changed_by: { full_name }, booking: { id, project_title, talent } }]
// }
export async function adminDashboardMetrics() {
  const supabase = await createClient();
  const today = todayISO();
  const [year, month] = today.split("-");
  const monthStart = `${year}-${month}-01`;
  const nextMonthStart = new Date(Date.UTC(Number(year), Number(month), 1))
    .toISOString()
    .slice(0, 10);
  const yearStart = `${year}-01-01`;

  const [
    activeTalent,
    monthBookings,
    ytdPayments,
    pendingPayments,
    escalated,
    expiringContracts,
    castingDeadlines,
    recentActivity,
  ] = await Promise.all([
    supabase
      .from("talent_profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("booking_date", monthStart)
      .lt("booking_date", nextMonthStart),
    supabase
      .from("payments")
      .select("gross_fee, currency")
      .gte("created_at", yearStart),
    supabase
      .from("payments")
      .select("net_talent_payment, currency")
      .neq("status", "talent_paid"),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("escalated", true)
      .eq("response_status", "pending"),
    supabase
      .from("talent_profiles")
      .select("id, first_name, last_name, contract_end_date")
      .eq("status", "active")
      .gte("contract_end_date", today)
      .lte("contract_end_date", plusDaysISO(60).slice(0, 10))
      .order("contract_end_date", { ascending: true }),
    supabase
      .from("open_castings")
      .select("id, title, deadline, status")
      .eq("status", "open")
      .lte("deadline", plusDaysISO(7))
      .order("deadline", { ascending: true }),
    supabase
      .from("booking_status_history")
      .select(
        `id, old_status, new_status, created_at,
         changed_by:profiles(id, full_name),
         booking:bookings(id, project_title, talent:talent_profiles(id, first_name, last_name))`
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const failed = [activeTalent, monthBookings, ytdPayments, pendingPayments, escalated, expiringContracts, castingDeadlines, recentActivity].find((r) => r.error);
  if (failed) throw new Error("Could not load the dashboard");

  const revenueYtd = {};
  for (const p of ytdPayments.data ?? []) addTo(revenueYtd, p.currency, p.gross_fee);
  const pendingPaymentsNet = {};
  for (const p of pendingPayments.data ?? []) {
    addTo(pendingPaymentsNet, p.currency, p.net_talent_payment);
  }

  return {
    activeTalentCount: activeTalent.count ?? 0,
    bookingsThisMonth: monthBookings.count ?? 0,
    revenueYtd,
    pendingPaymentsNet,
    escalatedCount: escalated.count ?? 0,
    expiringContracts: expiringContracts.data ?? [],
    castingDeadlines: castingDeadlines.data ?? [],
    recentActivity: recentActivity.data ?? [],
  };
}

// Talent overview page data (all reads RLS-scoped to the caller). Returns:
// {
//   bookingsYtdCount,
//   earningsYtdNet: { NGN: n, ... },   // net received (talent_paid) this year
//   pendingPaymentNet: { NGN: n, ... },
//   nextBooking: { id, project_title, booking_date, ... } | null,
//   upcomingBookings: [...next 3...],
//   latestComms: [...last 2 normalized notifications...],
//   community: { milestones: [...3], castings: [...3] }
// }
export async function talentOverview() {
  const supabase = await createClient();
  const today = todayISO();
  const yearStart = `${today.slice(0, 4)}-01-01`;

  const [bookingsYtd, payments, upcoming, comms, milestones, castings] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("booking_date", yearStart),
      supabase
        .from("payments")
        .select("net_talent_payment, currency, status, created_at, talent_payment_date"),
      supabase
        .from("bookings")
        .select(
          "id, project_title, status, booking_date, booking_end_date, location_city, media_usage, talent_fee, fee_currency"
        )
        .gte("booking_date", today)
        .neq("status", "cancelled")
        .order("booking_date", { ascending: true })
        .limit(3),
      myNotifications(),
      supabase
        .from("milestones")
        .select("id, visibility, display_text, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("open_castings_public")
        .select("id, title, category, location, deadline, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  if (bookingsYtd.error || payments.error || upcoming.error) {
    throw new Error("Could not load your overview");
  }

  const earningsYtdNet = {};
  const pendingPaymentNet = {};
  for (const p of payments.data ?? []) {
    if (p.status === "talent_paid") {
      if ((p.talent_payment_date ?? p.created_at) >= yearStart) {
        addTo(earningsYtdNet, p.currency, p.net_talent_payment);
      }
    } else {
      addTo(pendingPaymentNet, p.currency, p.net_talent_payment);
    }
  }

  const upcomingBookings = upcoming.data ?? [];
  const nextBooking =
    upcomingBookings.find((b) => b.status === "confirmed" || b.status === "pending") ??
    null;

  return {
    bookingsYtdCount: bookingsYtd.count ?? 0,
    earningsYtdNet,
    pendingPaymentNet,
    nextBooking,
    upcomingBookings,
    latestComms: comms.slice(0, 2),
    community: {
      milestones: milestones.data ?? [],
      castings: castings.data ?? [],
    },
  };
}
