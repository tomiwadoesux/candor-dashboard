// Demo data for the public /preview gallery. Plain fixtures — fed as props to
// the real dashboard components so every tab can be viewed without a login.
// Not wired to Supabase; the live app is untouched.

const ME = "t-me";

const d = (days) => new Date(Date.now() + days * 86400000).toISOString();
const dd = (days) => d(days).slice(0, 10);
const t = (h, m = 0) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

const NAMES = [
  ["Adaeze", "Okafor", "model", "lagos"],
  ["Malik", "Johnson", "model", "usa"],
  ["Priya", "Anand", "photographer", "london"],
  ["Tomiwa", "Balogun", "creative_director", "lagos"],
  ["Chloé", "Martin", "model", "london"],
  ["Kwame", "Mensah", "content_creator", "usa"],
  ["Zainab", "Bello", "model", "lagos"],
  ["Leah", "Cohen", "visual_artist", "london"],
];

function rosterRow(i) {
  const [first, last, category, loc] = NAMES[i];
  return {
    id: i === 0 ? ME : `t-${i}`,
    user_id: i === 0 ? "preview-user" : null,
    first_name: first,
    last_name: last,
    category,
    status: "active",
    exclusivity: i % 3 === 0 ? "exclusive" : "non_exclusive",
    primary_location: loc,
    secondary_location: i % 2 ? "london" : null,
    instagram_handle: `${first.toLowerCase()}.${last.toLowerCase()}`,
    phone: "+44 7700 900000",
    bio: "Represented by Candor across editorial, campaign and runway. Signed talent with a growing international book.",
    polaroid_url: null,
    contract_start_date: dd(-400),
    contract_end_date: i === 1 ? dd(28) : dd(300 + i * 20),
    contract_type: "full_management",
    commission_rate: 20,
    is_public: true,
    comp_card_status: i % 3 === 0 ? "current" : i % 3 === 1 ? "needs_update" : "current",
    digitals_status: i % 2 ? "current" : "needs_update",
    last_test_shoot: dd(-40),
    next_scheduled_shoot: i === 0 ? dd(12) : null,
    portfolio_notes: i === 0 ? "New digitals booked for next week — comp card refresh to follow." : null,
    created_at: d(-420),
  };
}

const ROSTER = NAMES.map((_, i) => rosterRow(i));

const ME_TALENT = {
  ...ROSTER[0],
  measurements: {
    id: "m-me",
    talent_id: ME,
    height_cm: 178,
    height_display: "5'10\"",
    bust: "82",
    waist: "61",
    hips: "89",
    shoe_uk: "7",
    shoe_eu: "40",
    hair_colour: "Dark brown",
    eye_colour: "Brown",
    dress_size: "UK 8",
    updated_at: d(-30),
  },
  portfolio_images: [1, 2, 3, 4].map((n) => ({
    id: `img-${n}`,
    image_url: "",
    image_type: n === 1 ? "polaroid" : n === 2 ? "editorial" : "campaign",
    is_primary_polaroid: n === 1,
    sort_order: n,
    created_at: d(-30 * n),
  })),
};

const CLIENT = (i, name) => ({
  id: `c-${i}`,
  company_name: name,
  contact_person: "Booking Desk",
  email: "bookings@brand.com",
  phone: "+44 20 7000 0000",
  address: "1 Studio Row, London",
  client_type: i % 2 ? "established" : "new",
  payment_terms: i % 2 ? "Net 14" : "100% upfront",
  is_active: true,
  notes: null,
  created_at: d(-200),
  bookings: [{ count: 2 + i }],
});

const CLIENTS = [
  "Arunla Studio", "Meridian Beauty", "House of Favour", "Lagos Fashion Week",
  "Northwell Denim", "Atelier Noir",
].map((n, i) => CLIENT(i, n));

const BOOKINGS = [
  { off: 6, end: 6, title: "Arunla SS26 Editorial", status: "confirmed", city: "lagos", fee: 450000, cur: "NGN", client: 0 },
  { off: 14, end: 15, title: "Meridian Beauty Campaign", status: "pending", city: "london", fee: 3200, cur: "GBP", client: 1 },
  { off: 21, end: 21, title: "House of Favour Lookbook", status: "casting_sent", city: "lagos", fee: 380000, cur: "NGN", client: 2 },
  { off: 2, end: 2, title: "Lagos Fashion Week — Runway", status: "confirmed", city: "lagos", fee: 250000, cur: "NGN", client: 3 },
  { off: -18, end: -18, title: "Northwell Denim AW25", status: "completed", city: "usa", fee: 4200, cur: "USD", client: 4 },
  { off: -45, end: -44, title: "Atelier Noir Campaign", status: "completed", city: "london", fee: 2800, cur: "GBP", client: 5 },
].map((b, i) => ({
  id: `b-${i}`,
  project_title: b.title,
  service_type: "Editorial",
  status: b.status,
  booking_date: dd(b.off),
  booking_end_date: dd(b.end),
  call_time: t(7, 30),
  location_city: b.city,
  location_address: "Studio 4, Victoria Island",
  duration_description: "Full day (8h)",
  talent_fee: b.fee,
  fee_currency: b.cur,
  total_client_fee: Math.round(b.fee * 1.25),
  media_usage: "Digital + social, 12 months",
  territory: "Worldwide",
  usage_term: "12 months",
  overtime_rate: Math.round(b.fee / 8),
  notes: i === 0 ? "Wardrobe provided. Natural glam. Car arranged from Lekki at 06:45." : null,
  pre_job_brief_sent: i < 2,
  call_sheet_sent: i === 0,
  created_at: d(-30 + i),
  client_idx: b.client,
  talent: { id: ME, first_name: "Adaeze", last_name: "Okafor" },
  client: { id: `c-${b.client}`, company_name: CLIENTS[b.client].company_name },
  status_history: [],
  payments: [],
  documents: [],
}));

const PAYMENTS = [
  { g: 450000, cur: "NGN", status: "talent_paid", b: 4, inv: "CAN-0041" },
  { g: 4200, cur: "USD", status: "talent_paid", b: 4, inv: "CAN-0039" },
  { g: 2800, cur: "GBP", status: "client_paid", b: 5, inv: "CAN-0044" },
  { g: 380000, cur: "NGN", status: "awaiting_client_payment", b: 2, inv: "CAN-0048" },
  { g: 3200, cur: "GBP", status: "awaiting_client_payment", b: 1, inv: "CAN-0049" },
].map((p, i) => {
  const commission = Math.round(p.g * 0.2);
  return {
    id: `p-${i}`,
    gross_fee: p.g,
    commission_rate: 20,
    commission_amount: commission,
    net_talent_payment: p.g - commission,
    currency: p.cur,
    status: p.status,
    client_payment_date: p.status !== "awaiting_client_payment" ? dd(-10) : null,
    talent_payment_date: p.status === "talent_paid" ? dd(-6) : null,
    invoice_number: p.inv,
    notes: null,
    created_at: d(-20 - i * 3),
    booking: {
      id: `b-${p.b}`,
      project_title: BOOKINGS[p.b].project_title,
      booking_date: BOOKINGS[p.b].booking_date,
      service_type: "Editorial",
      media_usage: "Digital + social, 12 months",
      territory: "Worldwide",
      usage_term: "12 months",
      client: {
        id: `c-${BOOKINGS[p.b].client_idx}`,
        company_name: CLIENTS[BOOKINGS[p.b].client_idx].company_name,
        contact_person: "Booking Desk",
        email: "bookings@brand.com",
        address: "1 Studio Row, London",
        payment_terms: CLIENTS[BOOKINGS[p.b].client_idx].payment_terms,
        client_type: CLIENTS[BOOKINGS[p.b].client_idx].client_type,
      },
    },
    talent: { id: ME, first_name: "Adaeze", last_name: "Okafor" },
  };
});

const rcp = (name, status = "pending", read = false) => ({
  id: `r-${name}`,
  is_read: read,
  response_status: status,
  response_text: null,
  responded_at: status !== "pending" ? d(-1) : null,
  talent: { id: `t-x`, first_name: name, last_name: "" },
});

const NOTIFICATIONS = [
  {
    id: "n-1", talent_id: ME, type: "availability_check",
    title: "Arunla SS26 — 14 Aug", body: "Full-day editorial for a fashion title, Victoria Island studio. Rate ₦450,000. Are you available?",
    is_read: true, requires_response: true, response_status: "accepted", response_text: null, responded_at: d(-1), escalated: false,
    created_at: d(-2), sender: { id: "u-b", full_name: "Ngozi Balogun" },
    talent: { id: ME, first_name: "Adaeze", last_name: "Okafor" }, recipients: [], recipient: null,
  },
  {
    id: "n-2", talent_id: ME, type: "pre_job_brief",
    title: "Call sheet — Thursday", body: "Call time 07:30, natural nails, bring the black heels. Car is arranged from Lekki at 06:45.",
    is_read: false, requires_response: true, response_status: "pending", response_text: null, responded_at: null, escalated: false,
    created_at: d(-0.02), sender: { id: "u-b", full_name: "Ngozi Balogun" },
    talent: { id: ME, first_name: "Adaeze", last_name: "Okafor" }, recipients: [], recipient: null,
  },
  {
    id: "n-3", talent_id: ME, type: "general",
    title: "Welcome to Candor", body: "Your portal is live — bookings, payments and castings all land here.",
    is_read: true, requires_response: false, response_status: "pending", response_text: null, responded_at: null, escalated: false,
    created_at: d(-9), sender: { id: "u-c", full_name: "Candor Office" },
    talent: { id: ME, first_name: "Adaeze", last_name: "Okafor" }, recipients: [], recipient: null,
  },
  {
    id: "n-4", talent_id: null, type: "announcement",
    title: "Studio closed 27 Dec", body: "The Lagos office is closed for the holiday from 27–29 December. Bookings resume in the new year.",
    is_read: true, requires_response: false, response_status: "pending", response_text: null, responded_at: null, escalated: false,
    created_at: d(-4), sender: { id: "u-c", full_name: "Candor Office" }, talent: null,
    recipients: [rcp("Malik", "pending", true), rcp("Chloé", "pending", true), rcp("Zainab", "pending", false)],
    recipient: { id: "r-me", is_read: true, response_status: "pending", response_text: null, responded_at: null },
  },
  {
    id: "n-5", talent_id: "t-1", type: "availability_check",
    title: "Meridian Beauty — 22 Aug", body: "Two-day beauty campaign in London. Are you free?",
    is_read: true, requires_response: true, response_status: "declined", response_text: "Away that week, sorry!", responded_at: d(-3), escalated: false,
    created_at: d(-5), sender: { id: "u-b", full_name: "Ngozi Balogun" },
    talent: { id: "t-1", first_name: "Malik", last_name: "Johnson" }, recipients: [], recipient: null,
  },
  {
    id: "n-6", talent_id: "t-6", type: "booking_update",
    title: "Runway confirmed", body: "You're confirmed for Lagos Fashion Week. Fitting details to follow.",
    is_read: false, requires_response: true, response_status: "pending", response_text: null, responded_at: null, escalated: true, escalated_at: d(-0.6),
    created_at: d(-1), sender: { id: "u-b", full_name: "Ngozi Balogun" },
    talent: { id: "t-6", first_name: "Zainab", last_name: "Bello" }, recipients: [], recipient: null,
  },
];

const MILESTONES = [
  { id: "ms-1", talent_id: ME, visibility: "named", display_text: "Booked my first international campaign with Meridian Beauty.", admin_approved: true, is_published: true, created_at: d(-6) },
  { id: "ms-2", talent_id: "t-4", visibility: "anonymous", display_text: "Signed a 12-month exclusive with a global denim house.", admin_approved: true, is_published: true, created_at: d(-12) },
  { id: "ms-3", talent_id: "t-2", visibility: "named", display_text: "Walked three shows at London Fashion Week.", admin_approved: true, is_published: true, created_at: d(-20) },
  { id: "ms-4", talent_id: ME, visibility: "named", display_text: "Cover feature confirmed for the autumn issue.", admin_approved: false, is_published: false, created_at: d(-1) },
  { id: "ms-5", talent_id: "t-6", visibility: "anonymous", display_text: "Reached 100k followers this month.", admin_approved: false, is_published: false, created_at: d(-2) },
].map((m) => {
  const rr = ROSTER.find((r) => r.id === m.talent_id) ?? ROSTER[0];
  return {
    ...m,
    talent: { id: rr.id, first_name: rr.first_name, last_name: rr.last_name, polaroid_url: null },
    booking: { id: "b-4", project_title: "Northwell Denim AW25", booking_date: dd(-18), client: { company_name: "Northwell Denim" } },
    approved_by: m.admin_approved ? { id: "u-c", full_name: "Ngozi Balogun" } : null,
  };
});

const CASTINGS = [
  { id: "cast-1", title: "Luxury fragrance — female lead", category: "model", location: "lagos", work: "Campaign", days: 9 },
  { id: "cast-2", title: "Denim capsule lookbook", category: "model", location: "london", work: "Lookbook", days: 4 },
  { id: "cast-3", title: "Beauty brand — hands & skin", category: "model", location: "usa", work: "E-commerce", days: 14 },
  { id: "cast-4", title: "Editorial — emerging designers", category: "model", location: "lagos", work: "Editorial", days: 6 },
].map((c, i) => ({
  id: c.id,
  title: c.title,
  description: "Seeking expressive, camera-confident talent for a considered campaign with a warm, editorial tone.",
  category: c.category,
  location: c.location,
  shoot_date_start: dd(c.days + 10),
  shoot_date_end: dd(c.days + 11),
  work_type: c.work,
  media_usage: "Digital + OOH, 12 months",
  requirements: "UK 6–10, comfortable on set",
  deadline: d(c.days),
  status: "open",
  brand_name_internal: ["Dior", "Levi's", "Fenty", "Confidential"][i],
  created_at: d(-3 - i),
  client: { id: `c-${i}`, company_name: CLIENTS[i].company_name },
  interests: i < 2 ? [{ id: "ci-1", response: "interested" }, { id: "ci-2", response: "not_available" }] : [],
}));

const CASTING_INTERESTS = [
  { casting_id: "cast-1", response: "interested", calendar_conflict: false, conflict_details: null, shortlisted: true, selected: false },
  { casting_id: "cast-4", response: "interested", calendar_conflict: true, conflict_details: "Overlaps Arunla SS26 Editorial", shortlisted: false, selected: false },
];

const CASTING_ANALYTICS = ROSTER.slice(0, 6).map((r, i) => ({
  talent_id: r.id,
  first_name: r.first_name,
  last_name: r.last_name,
  category: r.category,
  responses_count: 12 - i,
  interests_count: 9 - i,
  selected_count: Math.max(0, 4 - i),
  selection_rate_pct: Math.max(8, 44 - i * 7),
}));

const DOC_TYPES = [
  ["Management Agreement", "management_agreement", true, true],
  ["Booking Confirmation — Arunla SS26", "booking_confirmation", true, false],
  ["Call sheet — Lagos Fashion Week", "call_sheet", true, false],
  ["Payment statement — July", "payment_statement", true, false],
  ["Social media policy", "social_media_policy", false, false],
  ["Data privacy policy", "data_privacy_policy", false, false],
];
const DOCUMENTS = DOC_TYPES.map(([title, type, personal, signed], i) => ({
  id: `doc-${i}`,
  title,
  document_type: type,
  file_url: "#",
  is_personalised: personal,
  date_signed: signed ? dd(-380) : null,
  booking_id: i === 1 ? "b-0" : null,
  created_at: d(-i * 3 - 1),
  talent: { id: ME, first_name: "Adaeze", last_name: "Okafor" },
  booking: i === 1 ? { id: "b-0", project_title: "Aruna SS26 Editorial" } : null,
  uploaded_by: { id: "u-c", full_name: "Ngozi Balogun" },
}));

const PACKAGES = [
  { id: "pk-1", title: "Beauty shortlist — Meridian", client_name: "Meridian Beauty", note: "Six models for the SS26 beauty campaign.", talent_ids: ["t-me", "t-1", "t-4"], token: "abc123", expires_at: d(14), created_at: d(-4), views: [{ count: 7 }] },
  { id: "pk-2", title: "Runway selects — LFW", client_name: "Lagos Fashion Week", note: "Runway-ready talent for the closing show.", talent_ids: ["t-2", "t-6"], token: "def456", expires_at: d(-2), created_at: d(-20), views: [{ count: 23 }] },
  { id: "pk-3", title: "Editorial board — autumn", client_name: "House of Favour", note: null, talent_ids: ["t-me", "t-5"], token: "ghi789", expires_at: d(30), created_at: d(-1), views: [{ count: 2 }] },
];

const AI_CONVERSATIONS = [
  {
    id: "ai-1", created_at: d(-1), updated_at: d(-0.5),
    talent: { id: ME, first_name: "Adaeze", last_name: "Okafor", category: "model", polaroid_url: null },
    messages: [
      { role: "user", content: "When is my next booking?" },
      { role: "assistant", content: "Your next confirmed booking is Lagos Fashion Week — Runway in 2 days, call time 07:30." },
      { role: "user", content: "How much am I owed?" },
      { role: "assistant", content: "You have ₦380,000 and £3,200 in flight, both awaiting client payment." },
    ],
  },
  {
    id: "ai-2", created_at: d(-3), updated_at: d(-3),
    talent: { id: "t-1", first_name: "Malik", last_name: "Johnson", category: "model", polaroid_url: null },
    messages: [
      { role: "user", content: "What castings are open right now?" },
      { role: "assistant", content: "There are 4 open castings on your board. Two close within the week." },
    ],
  },
  {
    id: "ai-3", created_at: d(-8), updated_at: d(-8),
    talent: { id: "t-6", first_name: "Zainab", last_name: "Bello", category: "model", polaroid_url: null },
    messages: [
      { role: "user", content: "What did I earn this year?" },
      { role: "assistant", content: "Your net received this year is ₦360,000 and $3,360 after commission." },
    ],
  },
];

const STATUS_HISTORY = BOOKINGS.slice(0, 5).map((b, i) => ({
  id: `sh-${i}`,
  old_status: i % 2 ? "pending" : "casting_sent",
  new_status: b.status,
  created_at: d(-i - 0.2),
  changed_by: { id: "u-b", full_name: "Ngozi Balogun" },
  booking: { id: b.id, project_title: b.project_title, talent: b.talent },
}));

const TEAM = [
  { id: "u-ceo", full_name: "Ngozi Balogun", email: "ngozi@candor-management.com", role: "ceo", is_active: true, created_at: d(-800), last_login: d(-0.1) },
  { id: "u-md", full_name: "Daniel Ade", email: "daniel@candor-management.com", role: "md", is_active: true, created_at: d(-600), last_login: d(-1) },
  { id: "u-b1", full_name: "Aisha Yusuf", email: "aisha@candor-management.com", role: "booker", is_active: true, created_at: d(-300), last_login: d(-0.3) },
  { id: "u-b2", full_name: "Marcus Bell", email: "marcus@candor-management.com", role: "booker", is_active: false, created_at: d(-250), last_login: d(-40) },
];

// ---------------------------------------------------------------------------
// Derived shapes matching the query helpers, so preview pages can feed the real
// components exactly what they expect.

const PUBLIC_ROSTER = ROSTER.map((r) => ({
  id: r.id, first_name: r.first_name, last_name: r.last_name, category: r.category,
  primary_location: r.primary_location, instagram_handle: r.instagram_handle,
  bio: r.bio, polaroid_url: r.polaroid_url,
}));

// myNotifications() shape — talent-normalized (see lib/queries/notifications.js).
const MY_NOTIFICATIONS = NOTIFICATIONS.filter(
  (n) => n.talent_id === ME || n.talent_id === null
).map((n) => {
  const direct = n.talent_id === ME;
  const r = n.recipient;
  return {
    id: n.id, type: n.type, title: n.title, body: n.body, bookingId: n.booking_id ?? null,
    requiresResponse: n.requires_response, createdAt: n.created_at,
    isBroadcast: !direct,
    isRead: direct ? n.is_read : (r?.is_read ?? false),
    responseStatus: direct ? n.response_status : (r?.response_status ?? "pending"),
    responseText: direct ? n.response_text : (r?.response_text ?? null),
    respondedAt: direct ? n.responded_at : (r?.responded_at ?? null),
  };
});

// talentOverview().community.milestones — published, minimal shape.
const OVERVIEW_MILESTONES = MILESTONES.filter((m) => m.is_published).slice(0, 3).map((m) => ({
  id: m.id, visibility: m.visibility, display_text: m.display_text, created_at: m.created_at,
}));

// communityFeed() milestone items (kind === "milestone").
const COMMUNITY_MILESTONES = MILESTONES.filter((m) => m.is_published).map((m) => ({
  kind: "milestone", id: m.id, createdAt: m.created_at, displayText: m.display_text,
  visibility: m.visibility, talent: m.visibility === "named" ? m.talent : null,
}));

// myBookingsSplit()
const TODAY = new Date().toISOString().slice(0, 10);
const MY_BOOKINGS = {
  upcoming: BOOKINGS.filter((b) => b.booking_date >= TODAY && b.status !== "cancelled" && b.status !== "completed"),
  past: BOOKINGS.filter((b) => !(b.booking_date >= TODAY && b.status !== "cancelled" && b.status !== "completed")),
};

// openCastingsForTalent() — public castings + myInterest joined by casting_id.
const PUBLIC_CASTINGS = CASTINGS.map(({ brand_name_internal, client, interests, ...c }) => c);
const interestMap = new Map(CASTING_INTERESTS.map((i) => [i.casting_id, i]));
const TALENT_CASTINGS = PUBLIC_CASTINGS.map((c) => ({ ...c, myInterest: interestMap.get(c.id) ?? null }));

// listCastings() (admin) — with responsesCount / interestedCount.
const ADMIN_CASTINGS = CASTINGS.map(({ interests, ...c }) => ({
  ...c,
  responsesCount: interests?.length ?? 0,
  interestedCount: (interests ?? []).filter((i) => i.response === "interested").length,
}));

// myDocuments() grouping.
const DOC_GROUPS = { agreements: [], bookings: [], financial: [], policies: [], other: [] };
const GROUP_OF = {
  management_agreement: "agreements", welcome_agreement: "agreements", nda: "agreements", code_of_conduct: "agreements",
  booking_confirmation: "bookings", call_sheet: "bookings", payment_statement: "financial",
  social_media_policy: "policies", data_privacy_policy: "policies", other: "other",
};
for (const doc of DOCUMENTS) (DOC_GROUPS[GROUP_OF[doc.document_type]] ?? DOC_GROUPS.other).push(doc);

// clients list — flatten bookings(count).
const ADMIN_CLIENTS = CLIENTS.map(({ bookings, ...c }) => ({ ...c, bookingCount: bookings?.[0]?.count ?? 0 }));

// packages list — viewCount / expired.
const ADMIN_PACKAGES = PACKAGES.map((p) => ({
  ...p, viewCount: p.views?.[0]?.count ?? 0,
  expired: p.expires_at ? new Date(p.expires_at) < new Date() : false,
}));

// ai activity list.
const AI_ACTIVITY = AI_CONVERSATIONS.map((c) => ({
  id: c.id, talent: c.talent, messages: c.messages, messageCount: c.messages.length,
  questionCount: c.messages.filter((m) => m.role === "user").length,
  created_at: c.created_at, updated_at: c.updated_at,
}));

// Money helpers replicating the summary reducers.
function moneySum(rows, pick) {
  const out = {};
  for (const r of rows) out[r.currency] = (out[r.currency] ?? 0) + Number(pick(r));
  return out;
}
const yearStart = `${new Date().getFullYear()}-01-01`;
const paid = PAYMENTS.filter((p) => p.status === "talent_paid");
const pending = PAYMENTS.filter((p) => p.status !== "talent_paid");
const awaiting = PAYMENTS.filter((p) => p.status === "awaiting_client_payment");
const clientPaidRows = PAYMENTS.filter((p) => p.status === "client_paid");

export const preview = {
  me: ME_TALENT,
  roster: ROSTER,
  publicRoster: PUBLIC_ROSTER,
  team: TEAM,
  bookings: BOOKINGS,
  myBookings: MY_BOOKINGS,
  payments: PAYMENTS,
  myPayments: [...PAYMENTS].sort((a, b) => (a.booking.booking_date < b.booking.booking_date ? 1 : -1)),
  notifications: NOTIFICATIONS,
  myNotifications: MY_NOTIFICATIONS,
  talentList: ROSTER.map((r) => ({ id: r.id, name: `${r.first_name} ${r.last_name}` })),
  milestones: MILESTONES,
  pendingMilestones: MILESTONES.filter((m) => !m.admin_approved),
  publishedMilestones: MILESTONES.filter((m) => m.is_published),
  myMilestones: MILESTONES.filter((m) => m.talent_id === ME).map((m) => ({
    id: m.id, visibility: m.visibility, display_text: m.display_text,
    admin_approved: m.admin_approved, is_published: m.is_published, created_at: m.created_at, booking: m.booking,
  })),
  overviewMilestones: OVERVIEW_MILESTONES,
  communityMilestones: COMMUNITY_MILESTONES,
  overviewCastings: PUBLIC_CASTINGS.slice(0, 3),
  talentCastings: TALENT_CASTINGS,
  adminCastings: ADMIN_CASTINGS,
  documents: DOCUMENTS,
  docGroups: DOC_GROUPS,
  clients: ADMIN_CLIENTS,
  packages: ADMIN_PACKAGES,
  aiActivity: AI_ACTIVITY,
  statusHistory: STATUS_HISTORY,
  castingAnalytics: CASTING_ANALYTICS,
  overpayments: awaiting.map((p) => ({ ...p, dueDate: dd(-3), daysOverdue: 8 })),
  // aggregate summaries
  talentSummary: {
    earnedYtdGross: moneySum(PAYMENTS, (p) => p.gross_fee),
    paidYtdNet: moneySum(paid, (p) => p.net_talent_payment),
    pendingNet: moneySum(pending, (p) => p.net_talent_payment),
    nextExpected: pending[0] ?? null,
  },
  overview: {
    bookingsYtdCount: BOOKINGS.length,
    earningsYtdNet: moneySum(paid, (p) => p.net_talent_payment),
    pendingPaymentNet: moneySum(pending, (p) => p.net_talent_payment),
    nextBooking: MY_BOOKINGS.upcoming.find((b) => b.status === "confirmed" || b.status === "pending") ?? null,
    upcomingBookings: MY_BOOKINGS.upcoming,
    latestComms: MY_NOTIFICATIONS.slice(0, 2),
    community: { milestones: OVERVIEW_MILESTONES, castings: PUBLIC_CASTINGS.slice(0, 3) },
  },
  adminMetrics: {
    activeTalentCount: ROSTER.filter((r) => r.status === "active").length,
    bookingsThisMonth: 4,
    revenueYtd: moneySum(PAYMENTS, (p) => p.gross_fee),
    pendingPaymentsNet: moneySum(pending, (p) => p.net_talent_payment),
    escalatedCount: NOTIFICATIONS.filter((n) => n.escalated).length,
    expiringContracts: ROSTER.filter((r) => r.contract_end_date <= dd(60)).map((r) => ({
      id: r.id, first_name: r.first_name, last_name: r.last_name, contract_end_date: r.contract_end_date,
    })),
    castingDeadlines: CASTINGS.slice(0, 2).map((c) => ({ id: c.id, title: c.title, deadline: c.deadline, status: c.status })),
    recentActivity: STATUS_HISTORY,
  },
  paymentSummary: {
    awaiting: { count: awaiting.length, totals: {} },
    clientPaid: { count: clientPaidRows.length, totals: {} },
    talentPaid: { count: paid.length, totals: {} },
    ytdRevenue: moneySum(PAYMENTS, (p) => p.gross_fee),
    ytdCommission: moneySum(PAYMENTS, (p) => p.commission_amount),
    ytdRevenueByCur: moneySum(PAYMENTS.filter((p) => p.created_at >= yearStart), (p) => p.gross_fee),
  },
};
