// Editorial gradient palette — cool, low-chroma washes in the porcelain /
// petrol family. Reads quietly under our tokens in both light and dark modes.

const PALETTES = [
  // Petrol wash
  [
    "oklch(86% 0.05 232 / 0.5)",
    "oklch(78% 0.07 225 / 0.45)",
    "oklch(88% 0.03 250 / 0.4)",
  ],
  // North sea
  [
    "oklch(82% 0.06 250 / 0.5)",
    "oklch(76% 0.07 235 / 0.45)",
    "oklch(86% 0.04 210 / 0.4)",
  ],
  // Slate morning
  [
    "oklch(85% 0.03 260 / 0.5)",
    "oklch(79% 0.04 245 / 0.45)",
    "oklch(88% 0.02 230 / 0.4)",
  ],
  // Sage mist
  [
    "oklch(87% 0.04 165 / 0.5)",
    "oklch(80% 0.05 180 / 0.4)",
    "oklch(88% 0.03 210 / 0.4)",
  ],
  // Harbour
  [
    "oklch(84% 0.05 210 / 0.5)",
    "oklch(77% 0.06 232 / 0.45)",
    "oklch(87% 0.03 190 / 0.4)",
  ],
  // Graphite blue
  [
    "oklch(80% 0.03 245 / 0.5)",
    "oklch(74% 0.05 235 / 0.4)",
    "oklch(85% 0.02 255 / 0.4)",
  ],
  // Cool lavender
  [
    "oklch(86% 0.04 290 / 0.45)",
    "oklch(80% 0.05 270 / 0.4)",
    "oklch(88% 0.03 240 / 0.4)",
  ],
  // Aegean
  [
    "oklch(86% 0.06 210 / 0.5)",
    "oklch(80% 0.09 230 / 0.45)",
    "oklch(88% 0.05 190 / 0.4)",
  ],
];

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Pick a deterministic gradient for a given key (e.g. a talent id). Stable
// across reloads and across server/client renders.
export function gradientFor(key) {
  const idx = hashString(String(key)) % PALETTES.length;
  const palette = PALETTES[idx];
  const angle = (hashString(String(key) + "angle") % 180) + 90;
  return `linear-gradient(${angle}deg, ${palette[0]}, ${palette[1]} 50%, ${palette[2]})`;
}
