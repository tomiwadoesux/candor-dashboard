// Seed data for the store. Mutable state is hydrated from localStorage on the
// client; server renders use this seed directly.

import {
  talent as seedTalent,
  bookings,
  invoices,
  documents,
  openCastings,
  milestones,
  analyticsData,
  systemSettings,
  clients,
  onboardingSteps,
  recentActivity,
} from "@/lib/data";

// Admin team — enriched with contact details, per-person accent colour and role.
export const TEAM = [
  {
    id: "u1",
    name: "Ileri Obasanjo",
    short: "Ileri",
    email: "ileri@candoragency.com",
    phone: "+234 801 000 1111",
    instagram: "@ileri.o",
    role: "CEO",
    avatar: "IO",
    accent: "#C2410C", // terracotta
    location: "Lagos office",
  },
  {
    id: "u2",
    name: "Tife Adeyemi",
    short: "Tife",
    email: "tife@candoragency.com",
    phone: "+234 802 222 3333",
    instagram: "@tife.adeyemi",
    role: "Managing Director",
    avatar: "TA",
    accent: "#0369A1",
    location: "Lagos office",
  },
  {
    id: "u3",
    name: "Aliyu Musa",
    short: "Aliyu",
    email: "aliyu@candoragency.com",
    phone: "+234 803 444 5555",
    instagram: "@aliyu.candor",
    role: "Booker · Women's Board",
    avatar: "AM",
    accent: "#15803D",
    location: "Lagos office",
  },
  {
    id: "u4",
    name: "Tomi Johnson",
    short: "Tomi",
    email: "tomi@candoragency.com",
    phone: "+234 804 666 7777",
    instagram: "@tomi.books",
    role: "Finance · Payouts",
    avatar: "TJ",
    accent: "#7C3AED",
    location: "Lagos office",
  },
  {
    id: "u5",
    name: "Adaora Okeke",
    short: "Adaora",
    email: "adaora@candoragency.com",
    phone: "+234 805 888 9999",
    instagram: "@adaora.ok",
    role: "Talent Director",
    avatar: "AO",
    accent: "#B91C1C",
    location: "Lagos office",
  },
];

// Assign each talent a primary agent (booker) from the team.
const AGENT_ASSIGNMENTS = {
  1: "u3", // Zara → Aliyu
  2: "u3", // Phoenix → Aliyu
  3: "u3", // Atlas → Aliyu
  4: "u2", // Blaze → Tife
  5: "u2", // Velvet → Tife
  6: "u3", // Storm → Aliyu
  7: "u2", // Muse → Tife
};

export const TALENT_WITH_AGENTS = seedTalent.map((t) => ({
  ...t,
  agentId: AGENT_ASSIGNMENTS[t.id] || "u3",
  bio:
    t.bio ||
    `${t.stageName} joined Candor in ${new Date(
      t.joinDate
    ).getFullYear()}. Based in ${t.location}, represented across ${t.category.toLowerCase()} work.`,
  bank: t.bank || {
    bank: "GTBank",
    account: `•••• ${String(1000 + Number(t.id) * 37).slice(-4)}`,
    name: t.name,
    currency: "NGN",
  },
}));

// Current user is Zara for the talent side demo.
export const ME_ID = "1";
export const ADMIN_ME_ID = "u5"; // Adaora (Talent Director)

// Communications — threaded, with subject, target, reactions, read status.
export const SEED_THREADS = [
  {
    id: "t1",
    subject: "Afropolitan shoot — tearsheets",
    talentId: "1",
    createdById: "u3", // Aliyu → Zara
    createdByKind: "admin",
    toId: "1",
    toKind: "talent",
    createdAt: "2026-04-12T09:00:00",
    lastAt: "2026-04-16T11:30:00",
    messages: [
      {
        id: "m1",
        authorId: "u3",
        authorKind: "admin",
        body: "Afropolitan team loved the set — they'll share raw selects Friday. Want me to flag anything you'd prefer not to release?",
        at: "2026-04-12T09:00:00",
        reactions: { heart: ["1"] },
      },
      {
        id: "m2",
        authorId: "1",
        authorKind: "talent",
        body: "Anything mid-laugh please hold. I'll mark on the contact sheet once they send.",
        at: "2026-04-13T08:10:00",
        reactions: { thumbs: ["u3"] },
      },
      {
        id: "m3",
        authorId: "u3",
        authorKind: "admin",
        body: "Noted. Also — Vlisco invoice cleared this morning, Tomi will post your breakdown by EOD.",
        at: "2026-04-16T11:30:00",
        reactions: {},
      },
    ],
  },
  {
    id: "t2",
    subject: "Change payout bank details",
    talentId: "1",
    createdById: "1",
    createdByKind: "talent",
    toId: "u4", // Tomi (Finance)
    toKind: "admin",
    createdAt: "2026-04-10T14:22:00",
    lastAt: "2026-04-10T16:05:00",
    messages: [
      {
        id: "m1",
        authorId: "1",
        authorKind: "talent",
        body: "Switching payouts to my GTBank Naira account. New details attached. Can you confirm the April statement will land in the new account?",
        at: "2026-04-10T14:22:00",
        reactions: {},
      },
      {
        id: "m2",
        authorId: "u4",
        authorKind: "admin",
        body: "Have them on file — April payout routes to the new account. I'll send you a confirmation once it clears.",
        at: "2026-04-10T16:05:00",
        reactions: { thanks: ["1"] },
      },
    ],
  },
  {
    id: "t3",
    subject: "Pepsi TVC — wardrobe fitting",
    talentId: "1",
    createdById: "u3",
    createdByKind: "admin",
    toId: "1",
    toKind: "talent",
    createdAt: "2026-04-08T11:00:00",
    lastAt: "2026-04-08T11:00:00",
    messages: [
      {
        id: "m1",
        authorId: "u3",
        authorKind: "admin",
        body: "Fitting is 28 April at 2pm, Ikoyi studio. I've sent the brief to your email — call sheet drops next week.",
        at: "2026-04-08T11:00:00",
        reactions: {},
      },
    ],
  },
];

// Community posts — admin-curated content for the talent community feed.
export const SEED_COMMUNITY = [
  {
    id: "c1",
    kind: "milestone",
    title: "Afropolitan Magazine · cover story",
    body: "Zara lands the Afropolitan May cover — a Candor first. Tearsheets land in the Vault this week.",
    author: "Adaora",
    at: "2026-04-15T10:00:00",
    pinned: true,
  },
  {
    id: "c2",
    kind: "note",
    title: "Easter break — office hours",
    body: "Office is on skeleton crew 18–21 April. Urgent bookings? Text Aliyu on WhatsApp, everything else replies Tuesday.",
    author: "Ileri",
    at: "2026-04-10T09:30:00",
    pinned: false,
  },
  {
    id: "c3",
    kind: "note",
    title: "Digitals refresh window",
    body: "Studio booked for comp card shoots the last week of April. Aliyu is slotting everyone who's due — check your calendar invite.",
    author: "Aliyu",
    at: "2026-04-08T14:00:00",
    pinned: false,
  },
  {
    id: "c4",
    kind: "opportunity",
    title: "Vlisco SS26 — open casting",
    body: "Vlisco briefed a 4-talent campaign in early May. Open to the women's board — express interest in Castings by Wednesday.",
    author: "Aliyu",
    at: "2026-04-05T12:00:00",
    pinned: false,
  },
];

// Notifications list — activity feed. Generated from dashboard actions, topbar icon shows unread count.
export const SEED_NOTIFS = [
  {
    id: "n1",
    title: "Afropolitan invoice cleared",
    body: "INV-006 — ₦ 525K posted to your account.",
    at: "2026-04-16T11:45:00",
    kind: "payment",
    read: false,
  },
  {
    id: "n2",
    title: "New message from Aliyu",
    body: "Afropolitan shoot — tearsheets",
    at: "2026-04-16T11:30:00",
    kind: "message",
    read: false,
  },
  {
    id: "n3",
    title: "Pepsi TVC — wardrobe fitting",
    body: "28 Apr · 2pm · Ikoyi studio",
    at: "2026-04-08T11:00:00",
    kind: "booking",
    read: true,
  },
];

export {
  bookings,
  invoices,
  documents,
  openCastings,
  milestones,
  analyticsData,
  systemSettings,
  clients,
  onboardingSteps,
  recentActivity,
};
