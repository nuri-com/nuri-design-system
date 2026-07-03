/* ══════════════════════════════════════════════════════════════════
 * NURI · TYPE SCALE · SOURCE OF TRUTH (TS) · N+52 · decision 78
 * ──────────────────────────────────────────────────────────────────
 * The type-scale composite (the type token layer), authored
 * ONCE in TS as a SELF-CONTAINED, readable table of text styles. This is the
 * value flip §77 explicitly deferred to phase 4: decision 2 (CSS is the source
 * of truth) is REVERSED for the type COMPOSITE — the six step composites are no
 * longer read out of styles/tokens-primitive.css, they are WRITTEN INTO it. The
 * --nuri-type-* block becomes a projection of this module (pipeline/tokens-
 * parser.js Slice 0 · parsers/type-css.js), and build/tokens.ts's `type`
 * namespace is re-sourced onto it.
 *
 * Each step is its OWN complete style, in px, readable at a glance — fontSize +
 * lineHeight + letterSpacing + weight TOGETHER in one place:
 *
 *     md: { fontSize: 17, lineHeight: 1.29, letterSpacing: -0.02, weight: 'regular' }
 *
 * Deliberately NOT the DTCG `{ ref }` indirection dimensions.ts uses: there are
 * only six steps and the value of the table is seeing the whole style at once, so
 * the indirection into the font primitives does not pay. The emit DE-REFERENCES
 * end to end — `size` and `weight` become INLINE values in the CSS (no
 * var(--nuri-font-size-N) / var(--nuri-font-weight-X)); fontSize px → rem ÷16
 * (17 → 1.0625rem · the current spelling · rendered value identical), weight name
 * → the literal (regular → 400). So the --nuri-font-size-* / --nuri-font-weight-*
 * primitives go back to being a FOUNDATIONAL hand-CSS layer (styles/shell.css's
 * concern) — the fake type↔shell coupling dissolves, it is not documented.
 *
 * NOT in scope (LOCKED · hand · CSS-SoT · a separate Phase 4·3 residue): the
 * font-size / font-weight PRIMITIVES (--nuri-font-size-* · --nuri-font-weight-*),
 * --nuri-border-*, font families, durations. EMPHASIS stays orthogonal (decision
 * 77 · the uniform regular→semibold override) — it has NO per-step token; the
 * emitter resolves --nuri-font-weight-semibold directly (it stays referenced by
 * typography.css's [data-type-emphasis] rule + shell.css).
 *
 * Consumed by the node pipeline through the shared TS data loader (loadTypography ·
 * scripts/parsers/type-css.js). Base: decision 2 (reversed for the type composite
 * here) · 29 (line-height is a unitless ratio) · 54 / 55 (the type step) · 77
 * (the de-fusion · this executes its deferred value flip) · 78.
 * ══════════════════════════════════════════════════════════════════ */

// The font-weight names this scale uses — resolved to the literal at emit against
// the --nuri-font-weight-* primitives (which stay hand-CSS). `regular` only today
// (emphasis is the orthogonal semibold override · decision 77).
type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

// One complete text style — everything inline, in px (the readable table). lineHeight
// is a unitless ratio (decision 29 · × fontSize at render); letterSpacing is the em
// number (0 = none). Both stay RELATIVE — the × fontSize relative→absolute conversion
// lives ONCE in the consumer's typeStyle (RN) / native scaling (web · decision 54).
type TextStyle = { fontSize: number; lineHeight: number; letterSpacing: number; weight: FontWeight };

// The type scale — xs · sm · md · lg · xl · 3xl (2xl a deliberate reserved gap ·
// P11 · do NOT fill it). The KEYS are the scale; ordered = the CSS emit order.
export const type = {
  xs:    { fontSize: 13, lineHeight: 1.38, letterSpacing: 0,      weight: 'regular' },
  sm:    { fontSize: 14.5, lineHeight: 1.33, letterSpacing: -0.01,  weight: 'regular' },
  md:    { fontSize: 17, lineHeight: 1.29, letterSpacing: -0.02,  weight: 'regular' },
  lg:    { fontSize: 22, lineHeight: 1.27, letterSpacing: -0.015, weight: 'regular' },
  xl:    { fontSize: 30, lineHeight: 1.2,  letterSpacing: -0.015, weight: 'regular' },
  '3xl': { fontSize: 57, lineHeight: 1.19, letterSpacing: -0.02,  weight: 'regular' },
} as const satisfies Record<string, TextStyle>;
