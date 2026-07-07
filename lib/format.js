// Shared display formatters. Plain module — safe in both server and client
// components.

const CURRENCY_SYMBOLS = { NGN: "₦", GBP: "£", USD: "$" };

function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// money(120000, "NGN") -> "₦120,000" ; money(1234.5, "GBP") -> "£1,234.50"
export function money(amount, currency = "NGN") {
  const n = Number(amount ?? 0);
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const formatted = n.toLocaleString("en-GB", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

// "2026-07-07" -> "7 Jul 2026"
export function dateShort(value) {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// "2026-07-07" -> "Tuesday 7 July 2026"
export function dateLong(value) {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Accepts a Postgres time string ("09:30:00"), an ISO timestamp, or a Date.
// -> "09:30"
export function timeShort(value) {
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// -> "3h ago", "2d ago", "in 5d", "just now"
export function relativeTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const units = [
    ["y", 31536000000],
    ["mo", 2592000000],
    ["d", 86400000],
    ["h", 3600000],
    ["m", 60000],
  ];
  for (const [label, ms] of units) {
    if (abs >= ms) {
      const n = Math.floor(abs / ms);
      return diffMs < 0 ? `${n}${label} ago` : `in ${n}${label}`;
    }
  }
  return "just now";
}

const STATUS_OVERRIDES = {
  usa: "USA",
  usa_other: "USA / Other",
  nda: "NDA",
  md: "MD",
  ceo: "CEO",
  awaiting_client_payment: "Awaiting client payment",
  client_paid: "Client paid",
  talent_paid: "Paid",
};

// Humanizes any enum value: "casting_sent" -> "Casting sent".
export function statusLabel(status) {
  if (!status) return "";
  const key = String(status);
  if (STATUS_OVERRIDES[key]) return STATUS_OVERRIDES[key];
  const words = key.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
