/* ══════════════════════════════════════════════════════════════════
 * NURI · DIMENSION SOURCE OF TRUTH (TS)
 * ──────────────────────────────────────────────────────────────────
 * The dimension layer is authored ONCE here and projected into web CSS
 * and RN generated tokens. Semantic leaves own their direct values:
 * space/size/radius/border are pixel dimensions, ratio is unitless.
 *
 * Emit rules:
 *   · pixel dimensions emit Npx
 *   · 0 emits 0
 *   · ratios emit bare numbers
 *   · radius.full remains the 9999px pill sentinel
 * ══════════════════════════════════════════════════════════════════ */

type Leaf = { value: number; unit: 'px' | 'none' };

// L2 · space · the T-shirt gap/margin/padding scale between siblings
// (decision 36). Anchors smaller than size by design.
export const space = {
  none:  { value: 0, unit: 'px' },
  '2xs': { value: 2, unit: 'px' },
  xs:    { value: 4, unit: 'px' },
  sm:    { value: 6, unit: 'px' },
  md:    { value: 12, unit: 'px' },
  lg:    { value: 18, unit: 'px' },
  xl:    { value: 24, unit: 'px' },
  '2xl': { value: 36, unit: 'px' },
} as const satisfies Record<string, Leaf>;

// L2 · size · element dimensions (min-height / width of an element itself ·
// decision 36). Anchors larger than space (touch targets, control heights).
export const size = {
  xs:    { value: 18, unit: 'px' },
  sm:    { value: 24, unit: 'px' },
  md:    { value: 36, unit: 'px' },
  lg:    { value: 48, unit: 'px' },
  xl:    { value: 54, unit: 'px' },
  '2xl': { value: 72, unit: 'px' },
  '3xl': { value: 90, unit: 'px' },
} as const satisfies Record<string, Leaf>;

// L2 · radius · corner softness (amendment 36.1). sm/md/lg chain to px; full is
// the literal 9999px sentinel (a pill for rectangles, a circle when w=h).
export const radius = {
  sm:   { value: 6, unit: 'px' },
  md:   { value: 12, unit: 'px' },
  lg:   { value: 18, unit: 'px' },
  full: { value: 9999, unit: 'px' },
} as const satisfies Record<string, Leaf>;

// L2 · ratio · aspect-ratio for a box (width:height). UNITLESS by design — every
// ratio is a BARE number that ports verbatim across targets (CSS
// `aspect-ratio: 1.586`, RN `aspectRatio: 1.586` · the value is identical, no
// unit divergence). `square` = 1:1; `card` = 1.586:1
// (ISO/IEC 7810 ID-1, the credit-card ratio · a payment-card surface). The `none`
// unit makes the emit drop `px` (the named risk).
export const ratio = {
  square: { value: 1, unit: 'none' },
  card:   { value: 1.586, unit: 'none' },
} as const satisfies Record<string, Leaf>;

// Border widths promoted only when consumed. Current DS contract usage is the
// shared hairline for palette outlines and Separator.
export const border = {
  1: { value: 1, unit: 'px' },
} as const satisfies Record<string, Leaf>;
