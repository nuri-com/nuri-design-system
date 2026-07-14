/* ══════════════════════════════════════════════════════════════════
 * NURI · ICON MOTION SOURCE OF TRUTH
 * ──────────────────────────────────────────────────────────────────
 * Motion is part of a glyph's identity, not a host-component prop.
 * The icon emitter projects this data into both runtime registries.
 * ══════════════════════════════════════════════════════════════════ */

export const iconMotion = {
  spinner: 'ring',
  'spinner-ripple': 'ripple',
  'spinner-quarter': 'quarter',
  'spinner-coin': 'coin',
} as const;

export const iconMotionDurationMs = {
  ring: 960,
  ripple: 1300,
  quarter: 1300,
  coin: 1200,
} as const;
