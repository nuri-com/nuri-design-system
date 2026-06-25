/* ══════════════════════════════════════════════════════════════════
 * NURI · INTERACTIVE EFFECTS · SOURCE OF TRUTH (TS) · N+34 · L3b·2 · decision 70 / 67 / 73
 * ──────────────────────────────────────────────────────────────────
 * The `interactive` axis of the cascade (docs/cascade.md · L3 · the SECOND bespoke
 * axis · decision 67 / 73), authored ONCE in TS. interactive is the interaction
 * funnel: the structured per-part opt-in (decision 65.3 §6 / 65.4) that decomposes
 * interaction into independent EFFECTS — affordance, focus ring, press-scale,
 * disabled dimming — each its own gate, so a node opts into exactly what it needs.
 * It is BESPOKE-but-single-sourced (decision 67 / 73): NOT a member of the agnostic
 * Field table (resolve-map.ts · box/stack), and deliberately NOT forced into that
 * generic shape — "single-sourcing is the rule, not uniformity" (the palette
 * precedent · the kitchen-sink anti-goal).
 *
 * REVERSIBLE SHADOW (the L3.1 / palette discipline · roadmap/N+33-L3b-palette.md):
 * this SoT feeds pipeline/parsers/interactive-css.js, which generates the SHADOW
 * web namespace CSS (build/css-preview/interactive.css) PROVEN ≡ the hand
 * lib/components/interactive/interactive.css (the parity oracle). decision 2 (CSS
 * is the SoT) STANDS for the namespace layer — the hand interactive.css is still
 * the live source. NOTHING flips here: the RN factory (flattenPart · resolve.ts),
 * the pages, the recipe layer are untouched. The SoT flip (the decision-2 reversal
 * for the namespace layer) is L3c, not this slice. No decision opened.
 *
 * ── The effect set, exactly (lib/components/interactive/interactive.css) ─────
 *   effect           selector (after `.nuri-interactive`)   declaration(s)                         gate
 *   ───────────────────────────────────────────────────────────────────────────────────────────────────
 *   affordance       (none)                                 cursor · transition                    automatic
 *   focus            :focus-visible                         outline · outline-offset               automatic
 *   pressScale       [data-press-scale]:active              transform: scale(…)                    data-press-scale
 *   disabledGuard    [aria-disabled="true"]:active          transform: none                        automatic (reverts scale)
 *   disabledOpacity  :disabled, [aria-disabled="true"]      opacity                                automatic
 *
 * THE LOAD-BEARING ORDER (the centerpiece · the brief §5 · interactive.css:85-99):
 * pressScale and disabledGuard BOTH set `transform` at EQUAL specificity (0,3,0) —
 * a node that is `[data-press-scale][aria-disabled="true"]:active` matches BOTH, so
 * the cascade resolves `transform` by SOURCE ORDER. pressScale MUST emit BEFORE
 * disabledGuard so `transform: none` wins → a disabled control never scales. The
 * effects array order below IS that order (preserved by the emitter); the harness
 * proves it (pipeline/interactive-css.test.js · the order guard + the browser cell).
 * This is the L3.1 Guard-D order-sensitivity gap, here LIVE not latent.
 *
 * ── The SoT-vs-shell line (the surfaced sub-decision · like palette's SoT shape) ──
 * interactive is the THINNEST axis: mostly fixed STRUCTURE (5 rules) + a few token
 * REFS. So the SoT carries the rule content VERBATIM — each decl is a literal
 * `[prop, value]` pair, with the `var(--nuri-…)` interaction constants written
 * inline as strings. There is NO value transform (unlike palette's role-NAME →
 * `var(--nuri-<role>)` prefix, or dimensions' `{ ref }` → `var(--nuri-px-N)`): the
 * interaction constants are consumed DIRECTLY (decision 45 · the TabBar precedent ·
 * interactive.css:40-42), and the shorthands MIX literal + ref in one value
 * (`2px solid var(--nuri-focus-ring)`), so a `ref | literal` split would not fit.
 * The ONLY "derivation" the emitter does is the SELECTOR ASSEMBLY (`.nuri-interactive`
 * + the attr gate + the pseudo-state + comma-join) — the inverse-spelling of
 * flattenPart's gate logic (resolve.ts: `state.pressed && interactive.pressScale →
 * transform scale`). So the SoT = the whole rule set; the emitter is a structural
 * serializer, not a value transformer. (MERGED-NODE · 65.3 §6 / B1.5 §4.2: no
 * `<nuri-interactive>` element, no shell skeleton — the class lands on the node.)
 *
 * Consumed by the pipeline via a type-strip + data:-URL import (loadEffects ·
 * pipeline/parsers/interactive-css.js · reusing dimension-css.js#stripTypes · one
 * strip impl · decision 48): node 20 cannot import a .ts. Authored — like
 * dimensions.ts / palette-surface.ts — to keep the strip trivial: the only TS
 * apparatus is single-line `type` aliases and the trailing `as const satisfies`
 * suffix, with no imports. Base: decision 2 (reversed at L3c, not here) · 45 · 65.3
 * §6 · 65.4 · 67 · 70 · 73 · the L3.1 reversible-shadow discipline.
 * ══════════════════════════════════════════════════════════════════ */

// A selector PART appended to the `.nuri-interactive` base: an optional attribute
// gate (`[data-press-scale]` presence · `[aria-disabled="true"]` equality) and an
// optional pseudo-state (`:active` · `:focus-visible` · `:disabled`). The full
// selector = `.nuri-interactive` + (attr ?? '') + (state ?? ''). Both absent ⇒ the
// bare class (affordance).
type SelectorPart = { attr?: string; state?: string };

// A declaration — a literal `[property, value]` pair (the value verbatim, incl. any
// `var(--nuri-…)` constant inline · no value transform · the SoT-vs-shell line above).
type Decl = readonly [string, string];

// An effect = ONE CSS rule: a name (the channel · for self-doc + emit errors), the
// selector parts it applies to (the comma list · usually one · disabledOpacity has
// two), and its declarations.
type Effect = { name: string; on: readonly SelectorPart[]; decls: readonly Decl[] };

// ── The EFFECT SET (the bespoke single source · array order = the emit / hand-CSS
// order · LOAD-BEARING: pressScale strictly before disabledGuard · see header) ──
export const effects = [
  // Affordance · automatic. cursor + the press transition fire on every interactive
  // node; the transition carries the pressColor swap (palette's · background-color)
  // and the pressScale (transform). interactive.css:73-77.
  {
    name: 'affordance',
    on: [{}],
    decls: [
      ['cursor', 'pointer'],
      ['transition', 'background-color var(--nuri-duration-fast) ease, transform var(--nuri-duration-fast) ease'],
    ],
  },
  // Focus · automatic. The brand-coloured ring, never accent-derived. interactive.css:80-83.
  {
    name: 'focus',
    on: [{ state: ':focus-visible' }],
    decls: [
      ['outline', '2px solid var(--nuri-focus-ring)'],
      ['outline-offset', '2px'],
    ],
  },
  // pressScale · opt-in (data-press-scale). The tactile :active scale, gated so a
  // static surface never reacts. interactive.css:88-90. MUST precede disabledGuard.
  {
    name: 'pressScale',
    on: [{ attr: '[data-press-scale]', state: ':active' }],
    decls: [['transform', 'scale(var(--nuri-interaction-press-scale))']],
  },
  // disabledGuard · automatic. Reverts the press SCALE when disabled (a non-form
  // [aria-disabled] node still fires :active). Equal specificity to pressScale →
  // wins ONLY because it is emitted LATER (the load-bearing order). interactive.css:97-99.
  {
    name: 'disabledGuard',
    on: [{ attr: '[aria-disabled="true"]', state: ':active' }],
    decls: [['transform', 'none']],
  },
  // disabledOpacity · automatic. Both the native :disabled (form controls) and
  // [aria-disabled] (a non-form painting node) dim to the shared opacity. A
  // multi-selector rule (the comma list). interactive.css:104-107.
  {
    name: 'disabledOpacity',
    on: [{ state: ':disabled' }, { attr: '[aria-disabled="true"]' }],
    decls: [['opacity', 'var(--nuri-interaction-disabled-opacity)']],
  },
] as const satisfies readonly Effect[];
