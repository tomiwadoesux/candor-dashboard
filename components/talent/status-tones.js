// Semantic-token classes for booking / payment / portfolio statuses.
// Plain module — safe in both server and client components.

const BOOKING_TONES = {
  confirmed: { text: "text-success", dot: "bg-success", tint: "bg-success/10", ring: "ring-success/25" },
  pending: { text: "text-warning", dot: "bg-warning", tint: "bg-warning/10", ring: "ring-warning/25" },
  casting_sent: { text: "text-brand", dot: "bg-brand", tint: "bg-brand/10", ring: "ring-brand/25" },
  completed: { text: "text-muted-foreground", dot: "bg-muted-foreground", tint: "bg-muted/40", ring: "ring-border" },
  cancelled: { text: "text-destructive", dot: "bg-destructive", tint: "bg-destructive/10", ring: "ring-destructive/25" },
};

const NEUTRAL = {
  text: "text-muted-foreground",
  dot: "bg-muted-foreground",
  tint: "bg-muted/40",
  ring: "ring-border",
};

export function bookingTone(status) {
  return BOOKING_TONES[status] ?? NEUTRAL;
}

const PAYMENT_TONES = {
  awaiting_client_payment: { text: "text-warning", dot: "bg-warning" },
  client_paid: { text: "text-brand", dot: "bg-brand" },
  talent_paid: { text: "text-success", dot: "bg-success" },
};

export function paymentTone(status) {
  return PAYMENT_TONES[status] ?? NEUTRAL;
}

const ASSET_TONES = {
  current: { text: "text-success", dot: "bg-success" },
  needs_update: { text: "text-warning", dot: "bg-warning" },
  missing: { text: "text-destructive", dot: "bg-destructive" },
};

export function assetTone(status) {
  return ASSET_TONES[status] ?? NEUTRAL;
}
