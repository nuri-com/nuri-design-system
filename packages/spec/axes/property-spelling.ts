/* ══════════════════════════════════════════════════════════════════
 * NURI · PROPERTY-SPELLING REGISTRY · the per-target name vocabulary (decision 73 cl.2)
 * ──────────────────────────────────────────────────────────────────
 * The ONE place the RN ↔ web property-NAME divergence is single-sourced. Each
 * canonical concept id maps to its per-target SPELLING:
 *
 *   <canonical id>  →  { rn: <ViewStyle key> · css: <CSS property> }
 *
 * The cascade single-sources the VALUES (dimensions/colours/the axes); this
 * registry single-sources the SPELLING (decision 73 clause 2). Before it, the
 * spelling was scattered — resolve-map.ts's RN-spelled `prop`, namespace-css.js's
 * LOGICAL_OVERRIDES + kebab. Now the axes carry only `field → { property-CONCEPT,
 * value-source }` (resolve-map.ts's `prop` is a canonical id, NOT an RN name) and
 * each per-target emit looks the spelling up here: RN reads `.rn`, the web CSS
 * emit reads `.css`. This is the un-defer of resolve-map.ts's S1 "canonical
 * identities" (parked for P11 — "no oracle, no second consumer yet"); now there
 * are two consumers (the RN applier + the web emit), so it earns its keep.
 *
 * ── THE CANONICAL VOCABULARY (the de-RN-ification · decision 73 cl.2) ──
 * The id is target-NEUTRAL: the CSS LOGICAL-property concept, camelCased. So the
 * `css` column is the id kebab-cased (paddingInline → padding-inline), and the
 * `rn` column carries RN's PHYSICAL de-logicalization (paddingInline → RN's
 * paddingHorizontal · inlineSize → RN's width). The logical model is the neutral
 * one (writing-mode / RTL aware · the hand box.css already chose it); RN's
 * physical props are the divergence the `rn` column absorbs. Storing both
 * EXPLICITLY (not deriving css = kebab(id)) keeps the registry the literal SoT —
 * a future concept whose css ISN'T a plain kebab (none today) just states it.
 *
 * ── WHAT IS NOT HERE (the mechanism-divergent channels · decision 73 cl.2) ──
 * Only NAME-mappable properties live here. The channels whose RN↔web difference
 * is a MECHANISM, not a name, stay `via`-typed in their own axis and are NOT
 * registry entries:
 *   · fill / expand  — neutral grow/shrink/basis/minInline intents in
 *     resolve-map.ts; RN emits a multi-prop ViewStyle set and web emits the
 *     `flex` shorthand + a logical min-size.
 *   · fg             — RN a threaded foreground channel · web `color` +
 *     currentColor inheritance. (resolve.ts's resolvePalette.)
 *   · pressed        — RN a JS state swap · web `:active`. (the interactive axis.)
 * The palette BORDER channel (the `outline` variant's stroke) shipped BESPOKE,
 * not through this registry: RN spells it `borderWidth`/`borderColor` via the
 * resolver's PALETTE_BORDER_WIDTH and the web emit writes the `border`
 * shorthand off `--nuri-border-1` (mechanism-divergent like `fg`/`pressed`,
 * not a name map). Promoting the width into the dimension SoT is deliberately
 * DEFERRED to the catalog-arc gap batch (it lands with the Separator
 * primitive, which wants the same token). `outline` — the focus affordance
 * property — remains reserved (decision 30 · mapped-not-built · no consumer).
 * A `web` runtime column can join `{ rn, css }` if a
 * future axis applies inline web styles; box/stack need only `{ rn, css }` (the
 * web factory dispatches by data-attr, the namespace CSS supplies the property).
 *
 * ── HOME (transitional) ──
 * Lives in pipeline/ alongside the other axis SoTs (resolve-map.ts /
 * palette-surface.ts / interactive-effects.ts / typography-axis.ts), exposed to
 * @nuri/rn through the spec exports map (`@nuri/spec/property-spelling`). The
 * codegen-vs-data home re-org is convergence phase 4; the import path is dir-
 * agnostic, so re-homing changes only the exports map RHS, not the consumers.
 *
 * Consumed two ways: RN via a normal typed import (resolve.ts · `.rn` cast to
 * keyof ViewStyle at that boundary); the web emit through the shared TS data loader
 * (loadRegistry · packages/prototype/pipeline/parsers/namespace-css.js).
 * ══════════════════════════════════════════════════════════════════ */

// One concept's per-target property spelling. `rn` is a plain string (this
// package is RN-free — no `keyof ViewStyle`); the rn consumer casts it to
// keyof ViewStyle at its boundary (resolve.ts).
type Spelling = { rn: string; css: string };
// The registry shape.
type PropertySpelling = Record<string, Spelling>;

export const PROPERTY_SPELLING = {
  // ── stack · flex container (the keywords RN + CSS share verbatim ride the
  //    axis maps; only the property NAME is per-target) ──
  flexDirection:  { rn: 'flexDirection',  css: 'flex-direction' },
  alignItems:     { rn: 'alignItems',     css: 'align-items' },
  justifyContent: { rn: 'justifyContent', css: 'justify-content' },
  gap:            { rn: 'gap',            css: 'gap' },
  flexWrap:       { rn: 'flexWrap',       css: 'flex-wrap' },

  // ── box · sizing · padding · radii. Canonical = the CSS LOGICAL concept;
  //    `rn` de-logicalizes to RN's physical prop (the hand box.tsx mapping). ──
  inlineSize:         { rn: 'width',             css: 'inline-size' },
  blockSize:          { rn: 'height',            css: 'block-size' },
  minBlockSize:       { rn: 'minHeight',         css: 'min-block-size' },
  minInlineSize:      { rn: 'minWidth',          css: 'min-inline-size' },
  padding:            { rn: 'padding',           css: 'padding' },
  paddingInline:      { rn: 'paddingHorizontal', css: 'padding-inline' },
  paddingBlock:       { rn: 'paddingVertical',   css: 'padding-block' },
  paddingInlineStart: { rn: 'paddingStart',      css: 'padding-inline-start' },
  paddingInlineEnd:   { rn: 'paddingEnd',        css: 'padding-inline-end' },
  paddingBlockStart:  { rn: 'paddingTop',        css: 'padding-block-start' },
  paddingBlockEnd:    { rn: 'paddingBottom',     css: 'padding-block-end' },
  borderRadius:       { rn: 'borderRadius',      css: 'border-radius' },
  borderStartStartRadius: { rn: 'borderTopLeftRadius',  css: 'border-start-start-radius' },
  borderStartEndRadius:   { rn: 'borderTopRightRadius', css: 'border-start-end-radius' },
  // aspect-ratio is the rare concept whose RN key, web property, and canonical id
  // all coincide (no logical/physical divergence) — both targets spell it the same.
  aspectRatio:        { rn: 'aspectRatio',       css: 'aspect-ratio' },
} as const satisfies PropertySpelling;

// The canonical ids — the registry's OWN keys (typed · typo-safe). resolve-map.ts's
// Field `prop` is one of these; the per-target emits index the registry by it.
export type CanonicalId = keyof typeof PROPERTY_SPELLING;
