/* ══════════════════════════════════════════════════════════════════
 * NURI · DIMENSION CASCADE · SOURCE OF TRUTH (TS) · N+31 · decision 70
 * ──────────────────────────────────────────────────────────────────
 * The dimension layer of the cascade (docs/cascade.md · L1 px primitives +
 * the L2 space/size/radius semantics), authored ONCE in TS. This is the FIRST
 * real flip: decision 2 (CSS is the source of truth) is REVERSED for the
 * dimension layer ONLY — these values are no longer read out of the CSS, they
 * are WRITTEN INTO it. styles/tokens-{primitive,semantic}.css become a
 * projection of this module (pipeline/tokens-parser.js Slice 0 · the in-place
 * passthrough emit). The colour layer's CSS stays the SoT (the next slice).
 *
 * The reference structure px←semantic IS the cascade: a semantic leaf names a
 * px primitive ({ px: 36 } → var(--nuri-px-36)), it does not restate a value.
 * The two literals sit OUTSIDE the px scale by design — space.none = 0 (a
 * collapsed gutter · decision 32 retired --nuri-px-0) and radius.full = 9999px
 * (the sentinel border-radius clamps to min(w/2,h/2) → pill/circle · amendment
 * 36.1). Adding a token here grows the CSS on the next build; no parser edit.
 *
 * NOT in scope (LOCKED · hand · passed through verbatim by the emitter): the
 * reserved radius PRIMITIVES (--nuri-radius-{none,xs,xl,2xl} · P11 · they live
 * in tokens-primitive.css, a different family than the space/size/radius
 * SEMANTICS owned here), --nuri-border-*, the type scale, fonts, every colour.
 *
 * Consumed by the node pipeline via a type-strip + data:-URL import
 * (loadDimensions · pipeline/parsers/dimension-css.js · node 20 cannot import a
 * .ts) — the same technique the descriptor browser-ESM twins (decision 69) and
 * the L3.1 Field-table loader use. Authored to be trivially strippable: only
 * single-line `export type …;` and `export const X: T = …` constructs, no
 * imports. Base: decision 2 (reversed here) · 32 · 36 · 36.1 · 48 · 70.
 * ══════════════════════════════════════════════════════════════════ */

// L1 · the px primitive scale. value == name (decision 32): --nuri-px-N is
// literally N pixels. Ordered as authored = the CSS emit order.
export type PxValue = 2 | 4 | 6 | 12 | 18 | 24 | 28 | 36 | 48 | 60 | 72 | 90;
export const PX_SCALE: PxValue[] = [2, 4, 6, 12, 18, 24, 28, 36, 48, 60, 72, 90];

// A semantic leaf is EITHER a reference to a px primitive (the cascade) OR a
// literal (the 0 / 9999px sentinels that have no px backing by design).
export type DimLeaf = { px: PxValue } | { literal: string };

// L2 · space · the T-shirt gap/margin/padding scale between siblings
// (decision 36). Anchors smaller than size by design.
export const SPACE: Record<string, DimLeaf> = {
  none:  { literal: '0' },
  '2xs': { px: 2 },
  xs:    { px: 4 },
  sm:    { px: 6 },
  md:    { px: 12 },
  lg:    { px: 18 },
  xl:    { px: 24 },
  '2xl': { px: 36 },
};

// L2 · size · element dimensions (min-height / width of an element itself ·
// decision 36). Anchors larger than space (touch targets, control heights).
export const SIZE: Record<string, DimLeaf> = {
  xs:    { px: 18 },
  sm:    { px: 28 },
  md:    { px: 36 },
  lg:    { px: 48 },
  xl:    { px: 60 },
  '2xl': { px: 72 },
  '3xl': { px: 90 },
};

// L2 · radius · corner softness (amendment 36.1). sm/md/lg chain to px; full
// is the literal 9999px sentinel (a pill for rectangles, a circle when w=h).
export const RADIUS: Record<string, DimLeaf> = {
  sm:   { px: 6 },
  md:   { px: 12 },
  lg:   { px: 18 },
  full: { literal: '9999px' },
};
