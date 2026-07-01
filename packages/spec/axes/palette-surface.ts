/* ══════════════════════════════════════════════════════════════════
 * NURI · PALETTE SURFACE · SOURCE OF TRUTH (TS) · N+33 · L3b·1 · decision 70 / 67
 * ──────────────────────────────────────────────────────────────────
 * The `palette` axis of the cascade (docs/cascade.md · L3 · the FIRST bespoke
 * axis · decision 67), authored ONCE in TS. palette is the colour funnel: a
 * SURFACE role table that resolves a node's COMPLETE pair — background AND
 * foreground — plus the optional pressed swap. It is BESPOKE-but-single-sourced
 * (decision 67): NOT a member of the agnostic Field table (resolve-map.ts ·
 * box/stack/typography), and deliberately NOT forced into that generic shape —
 * "single-sourcing is the rule, not uniformity" (the kitchen-sink anti-goal).
 *
 * REVERSIBLE SHADOW (the L3.1 discipline · roadmap/N+30-L3.1.md): this SoT feeds
 * pipeline/parsers/palette-css.js, which generates the SHADOW web namespace CSS
 * (build/css-preview/palette.css) PROVEN ≡ the hand lib/components/palette/
 * palette.css (the parity oracle). decision 2 (CSS is the SoT) STANDS for the
 * namespace layer — the hand palette.css is still the live source (→ build/
 * palette.ts via pipeline/parsers/palette.js · byte-identical). NOTHING flips
 * here: the factory, the pages, the recipe layer are untouched. The SoT flip
 * (decision-2 reversal for the namespace layer) is L3c, not this slice.
 *
 * ── The role table, exactly (lib/components/palette/palette.css) ─────
 *   input            background          color              pressed (:active · gated)
 *   ───────────────────────────────────────────────────────────────────
 *   variant=solid    accent-solid        accent-on-solid    accent-solid-pressed
 *   variant=soft     bg-strong           text-primary       bg-pressed
 *   variant=ghost    <transparent>       text-primary       bg-subtle
 *   variant=subtle   — (fg-only)         border-strong      —
 *   chrome=canvas    bg-canvas           text-primary       —
 *   chrome=subtle    bg-subtle           text-primary       —
 *   chrome=strong    bg-strong           text-primary       —
 *
 * THE THREE IRREGULARITIES, modelled by SHAPE (not special-cased downstream):
 *   · fg-only (subtle)   → `bg` is OPTIONAL (absent ⇒ no background channel · the
 *     one near-invisible glyph role · decision 50).
 *   · no-pressed (chrome
 *     slot + subtle)      → `pressed` is OPTIONAL (absent ⇒ no :active swap). The
 *     chrome slot is theme-only (no accent identity, no press).
 *   · ghost's transparent → a `{ literal }` paint, structurally DISTINCT from a
 *     role reference — the same `{ ref } | { value }` split dimensions.ts uses for
 *     the px-backed vs. literal leaves. An EXPLICIT `background: transparent` (the
 *     complete-pair rule · NOT an absent declaration · palette.css).
 *
 * A paint that is a bare string is an L2 role NAME — the emit prefixes `--nuri-`
 * → `var(--nuri-<role>)` (the L2 semantic vocabulary · accent-solid, bg-canvas,
 * text-primary, …). `variant` XOR `chrome` (a node carries one or the other,
 * never both · the dispatch is mutually exclusive). The accent×theme cascade is
 * NOT here: palette only writes `var(--nuri-accent-*)` and rides the EXISTING
 * [data-accent] scope (the decision-63 #4b/#6b self-scope already lives in
 * tokens-semantic.css · N+32 · do not reproduce it).
 *
 * Consumed by the node pipeline through the shared TS data loader (loadSurface ·
 * packages/prototype/pipeline/parsers/palette-css.js). Base: decision 2 (reversed
 * at L3c, not here) · 11 · 30 · 50 · 65.3 §6 · 67 · 70 · the L3.1
 * reversible-shadow discipline.
 * ══════════════════════════════════════════════════════════════════ */

// A paint value — the universal channel shape: EITHER a bare L2 role NAME (the
// emit prefixes `--nuri-` → var(--nuri-<role>)) OR a `{ literal }` CSS value (the
// `transparent` exception · no var · structurally distinct, the dimensions.ts
// reference-vs-literal split).
type Paint = string | { literal: string };

// A surface role — the complete pair. `fg` is ALWAYS present (every row paints a
// foreground, incl. the fg-only `subtle`); `bg` absent ⇒ fg-only; `pressed`
// absent ⇒ no :active swap (the chrome slot + subtle).
type Surface = { bg?: Paint; fg: Paint; pressed?: Paint };

// The table is split by the two mutually-exclusive INPUT axes (variant XOR
// chrome) — the shape the dispatch keys on.
type SurfaceTable = { variant: Record<string, Surface>; chrome: Record<string, Surface> };

// ── The SURFACE role table (the bespoke single source · key order = the emit /
// hand-CSS order: variant solid→soft→ghost→subtle, then chrome canvas→subtle→
// strong) ──
export const surface = {
  variant: {
    solid:  { bg: 'accent-solid',            fg: 'accent-on-solid', pressed: 'accent-solid-pressed' },
    soft:   { bg: 'bg-strong',               fg: 'text-primary',    pressed: 'bg-pressed' },
    ghost:  { bg: { literal: 'transparent' }, fg: 'text-primary',   pressed: 'bg-subtle' },
    subtle: { fg: 'border-strong' },
  },
  chrome: {
    canvas: { bg: 'bg-canvas', fg: 'text-primary' },
    subtle: { bg: 'bg-subtle', fg: 'text-primary' },
    strong: { bg: 'bg-strong', fg: 'text-primary' },
  },
} as const satisfies SurfaceTable;
