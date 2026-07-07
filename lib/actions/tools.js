"use server";

// Admin speed-tools. parseBrief: paste a messy client brief (email/WhatsApp),
// get structured casting/booking fields back from the AI.

import { assertRole } from "@/lib/auth";
import { hfChat } from "@/lib/ai/hf";

const TALENT_CATEGORIES = [
  "model", "photographer", "creative_director", "visual_artist", "artisan",
  "graphic_designer", "content_creator", "influencer", "brand_partner", "educator",
];
const BOOKING_LOCATIONS = ["lagos", "london", "usa_other"];
const CURRENCIES = ["NGN", "GBP", "USD"];

async function guard(...roles) {
  try {
    return await assertRole(...roles);
  } catch {
    return null;
  }
}

// ---- reply parsing / validation helpers ------------------------------------

function extractJson(reply) {
  // Strip markdown fences, then take the outermost {...} block.
  const cleaned = String(reply).replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function oneOf(value, list) {
  return typeof value === "string" && list.includes(value) ? value : null;
}

function isoDate(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return Number.isNaN(new Date(v).getTime()) ? null : v;
}

function text(value, max = 2000) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

function positiveNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function systemPrompt(today) {
  return [
    "You extract structured briefs for Candor Management Agency, a talent agency (models, photographers, creatives) operating in Lagos, London and the USA.",
    `Today's date is ${today}. Resolve every relative date ("next Friday", "in two weeks") against it.`,
    "The user pastes a raw client brief (email, WhatsApp, anything). Reply with EXACTLY ONE strict JSON object and NOTHING else — no markdown fences, no commentary. Keys (all required, use null when unknown):",
    '{"kind":"casting"|"booking", "title":string, "description":string|null, "category":"model"|"photographer"|"creative_director"|"visual_artist"|"artisan"|"graphic_designer"|"content_creator"|"influencer"|"brand_partner"|"educator", "location":"lagos"|"london"|"usa_other", "shootDateStart":"YYYY-MM-DD"|null, "shootDateEnd":"YYYY-MM-DD"|null, "deadline":"YYYY-MM-DD"|null, "workType":string|null, "mediaUsage":string|null, "requirements":string|null, "budget":number|null, "currency":"NGN"|"GBP"|"USD"|null, "brandName":string|null, "notes":string|null}',
    'Rules: "kind" is "booking" only when a specific talent is already chosen with a confirmed date/fee; otherwise "casting". "title" is a short professional project title WITHOUT the brand name (the title is shown to talent). "description" is a talent-safe summary, also without the brand name. "brandName" holds the client/brand (internal only). "deadline" is when talent must respond, if stated. "budget" is the numeric fee only. Put anything useful that fits nowhere else in "notes".',
  ].join("\n");
}

// (prevState, formData) for useActionState. formData: brief (min 20 chars).
// Returns { success: true, parsed } or { error }.
export async function parseBrief(prevState, formData) {
  const profile = await guard("booker", "md", "ceo");
  if (!profile) return { error: "Not authorized" };

  const brief = String(formData.get("brief") ?? "").trim();
  if (brief.length < 20) {
    return { error: "Paste a little more of the brief — at least 20 characters." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const result = await hfChat(
    [
      { role: "system", content: systemPrompt(today) },
      { role: "user", content: brief.slice(0, 8000) },
    ],
    { maxTokens: 800, temperature: 0.1 }
  );

  if (result.error) return { error: "unavailable" };

  const raw = extractJson(result.reply);
  if (!raw) {
    return { error: "The AI reply wasn't valid JSON — try parsing again." };
  }

  const parsed = {
    kind: oneOf(raw.kind, ["casting", "booking"]) ?? "casting",
    title: text(raw.title, 255),
    description: text(raw.description),
    category: oneOf(raw.category, TALENT_CATEGORIES),
    location: oneOf(raw.location, BOOKING_LOCATIONS),
    shootDateStart: isoDate(raw.shootDateStart),
    shootDateEnd: isoDate(raw.shootDateEnd),
    deadline: isoDate(raw.deadline),
    workType: text(raw.workType, 100),
    mediaUsage: text(raw.mediaUsage, 255),
    requirements: text(raw.requirements),
    budget: positiveNumber(raw.budget),
    currency: oneOf(raw.currency, CURRENCIES),
    brandName: text(raw.brandName, 255),
    notes: text(raw.notes),
  };

  return { success: true, parsed };
}
