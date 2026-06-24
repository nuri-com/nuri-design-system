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
 * The shape is the DTCG model — `name → value | reference` (the token-standards
 * eval · roadmap/token-standards-eval.md §5): a leaf is EITHER a reference to a
 * px primitive (the cascade) OR a structured literal. The reference structure
 * px←semantic IS the cascade: a semantic leaf names a px primitive
 * ({ ref: 36 } → var(--nuri-px-36)), it does not restate a value. The two
 * literals sit OUTSIDE the px scale by design — space.none = { value: 0 } (a
 * collapsed gutter · decision 32 retired --nuri-px-0 · emitted unitless `0`) and
 * radius.full = { value: 9999 } (the sentinel border-radius clamps to
 * min(w/2,h/2) → pill/circle · amendment 36.1). Adding a token here grows the
 * CSS on the next build; no parser edit.
 *
 * NOT in scope (LOCKED · hand · passed through verbatim by the emitter): the
 * reserved radius PRIMITIVES (--nuri-radius-{none,xs,xl,2xl} · P11 · they live
 * in tokens-primitive.css, a different family than the space/size/radius
 * SEMANTICS owned here), --nuri-border-*, the type scale, fonts, every colour.
 *
 * Consumed by the node pipeline via a type-strip + data:-URL import
 * (loadDimensions · pipeline/parsers/dimension-css.js · node 20 cannot import a
 * .ts) — the same technique the descriptor browser-ESM twins (decision 69) and
 * the L3.1 Field-table loader use. Authored to keep the strip trivial: the only
 * TS apparatus is single-line `type` aliases and the const-assertion suffixes,
 * with no imports. Base: decision 2 (reversed here) · 32 · 36 · 36.1 · 48 · 70 ·
 * the token-standards eval (the DTCG shape · move b).
 * ══════════════════════════════════════════════════════════════════ */

// L1 · the px primitive scale. The KEYS are the scale (no array restated);
// value == name (decision 32): --nuri-px-N is literally N pixels. `Px` derives
// from the keys (no union restated). Ordered ascending = the CSS emit order.
export const px = { 2: 2, 4: 4, 6: 6, 12: 12, 18: 18, 24: 24, 28: 28, 36: 36, 48: 48, 60: 60, 72: 72, 90: 90 } as const;
export type Px = keyof typeof px;

// A semantic leaf is the universal token shape — `value | reference`: EITHER a
// reference to a px primitive (the cascade) OR a structured literal (the 0 /
// 9999 sentinels that have no px backing by design). The axis vocab derives via
// `keyof typeof space` etc.
type Leaf = { ref: Px } | { value: number; unit: 'px' };

// L2 · space · the T-shirt gap/margin/padding scale between siblings
// (decision 36). Anchors smaller than size by design.
export const space = {
  none:  { value: 0, unit: 'px' },
  '2xs': { ref: 2 },
  xs:    { ref: 4 },
  sm:    { ref: 6 },
  md:    { ref: 12 },
  lg:    { ref: 18 },
  xl:    { ref: 24 },
  '2xl': { ref: 36 },
} as const satisfies Record<string, Leaf>;

// L2 · size · element dimensions (min-height / width of an element itself ·
// decision 36). Anchors larger than space (touch targets, control heights).
export const size = {
  xs:    { ref: 18 },
  sm:    { ref: 28 },
  md:    { ref: 36 },
  lg:    { ref: 48 },
  xl:    { ref: 60 },
  '2xl': { ref: 72 },
  '3xl': { ref: 90 },
} as const satisfies Record<string, Leaf>;

// L2 · radius · corner softness (amendment 36.1). sm/md/lg chain to px; full is
// the literal 9999px sentinel (a pill for rectangles, a circle when w=h).
export const radius = {
  sm:   { ref: 6 },
  md:   { ref: 12 },
  lg:   { ref: 18 },
  full: { value: 9999, unit: 'px' },
} as const satisfies Record<string, Leaf>;
