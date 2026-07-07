// Editorial gradient palette — picked to read well under our tokens in both
// light and dark modes. Gradients combine our OKLCH chart tokens with a couple
// of editorial accents.

const PALETTES = [
  // Sunset
  [
    "oklch(88% 0.09 40 / 0.55)",
    "oklch(82% 0.1 80 / 0.45)",
    "oklch(78% 0.08 20 / 0.45)",
  ],
  // Dusk (cool)
  [
    "oklch(82% 0.07 260 / 0.5)",
    "oklch(80% 0.08 220 / 0.45)",
    "oklch(84% 0.06 310 / 0.4)",
  ],
  // Gold leaf
  [
    "oklch(90% 0.08 90 / 0.55)",
    "oklch(82% 0.12 65 / 0.45)",
    "oklch(86% 0.05 55 / 0.4)",
  ],
  // Terracotta wash
  [
    "oklch(86% 0.09 35 / 0.55)",
    "oklch(78% 0.14 28 / 0.45)",
    "oklch(88% 0.06 20 / 0.4)",
  ],
  // Fig & rose
  [
    "oklch(84% 0.08 355 / 0.5)",
    "oklch(80% 0.11 5 / 0.45)",
    "oklch(88% 0.05 320 / 0.4)",
  ],
  // Moss
  [
    "oklch(86% 0.06 140 / 0.5)",
    "oklch(80% 0.08 160 / 0.45)",
    "oklch(84% 0.05 100 / 0.4)",
  ],
  // Ink & clay
  [
    "oklch(82% 0.05 50 / 0.45)",
    "oklch(78% 0.04 250 / 0.4)",
    "oklch(86% 0.06 30 / 0.4)",
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
