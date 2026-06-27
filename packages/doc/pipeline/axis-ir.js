/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · AXIS → doc IR (N+43 · A4b)
 *
 * Reshapes each of @nuri/spec's 5 namespace-axis SoTs into the IR the doc-gen
 * renders — the axis-family sibling of descriptor-ir.js (the component family).
 * The axes are BESPOKE (decision 73 · 2 agnostic + 3 bespoke), so the docs are
 * too: FOUR builders, one per SoT shape, not one mould —
 *   · box + stack  ← resolve-map.ts (BOX_FIELDS/STACK_FIELDS) + property-spelling.ts
 *                    → the Field table (input → css/rn name + value-source).
 *   · palette      ← palette-surface.ts (surface) → the role table (variant XOR
 *                    chrome → bg/fg/pressed, each resolved to a swatch + hex via
 *                    the N+42 colour resolver · the ONLY axis that resolves tokens).
 *   · interactive  ← interactive-effects.ts (effects) → the effect set (assembled
 *                    selector · decls · gate) + the load-bearing order note.
 *   · typography   ← tokens.type (the 6 type-sizes) + typography-axis.ts → THREE
 *                    surfaces (decision 77 · the de-fusion): the agnostic `size` axis
 *                    (the type-step → web [data-type-style] / RN typeStyle · the
 *                    Input|Web|RN grammar this spike LOCKS), the orthogonal `emphasis`
 *                    boolean ([data-type-emphasis] / typeStyle's 2nd arg), and the
 *                    web-only nuri-typography WRAPPER (muted + align · no RN analog).
 *                    The type SCALE composite is a Foundations doc (A4c · referenced).
 *
 * Each builder is a PURE function of its SoT data (read by build.js / Guard G via
 * the strip.js loader · NEVER spec's pipeline functions · convergence §5 ·
 * decision 75) → a structured IR. The renderers (docs.js#emitAxisPage) format it;
 * the page re-emits byte-identical (decision 35 · the doc CI gate).
 * ────────────────────────────────────────────────────────────── */

// ── box / stack ← the agnostic Field table (resolve-map.ts) + the per-target
// property-spelling registry (property-spelling.ts · decision 73 cl.2). Per input
// field: the input key, its CSS + RN property name (the registry's two columns),
// and how its value derives (`via`). Object.entries preserves the SoT's declared
// order (load-bearing · resolve-map.ts) → the table row order matches the engine. ──
export function fieldsAxisIr(source, fields, registry) {
  const rows = Object.entries(fields).map(([input, field]) => fieldRow(source, input, field, registry));
  return { source, kind: 'fields', rows, hasExpand: rows.some((r) => r.via === 'expand') };
}

// One field → { input, css, rn, via, detail }. The per-target spelling comes from
// the registry, keyed by the field's CANONICAL id (resolve-map's `prop`) — the de-
// RN-ification (decision 73 cl.2). The mechanism-divergent `expand` arm (fill) has
// NO registry entry (RN a multi-prop ViewStyle set · web the `flex` shorthand): it
// carries css='flex' (the SoT's documented web spelling) · rn=null (the per-value
// RN expansion lives in `detail`, surfaced in the Value column + the caption).
function fieldRow(source, input, field, registry) {
  if (field.via === 'expand') {
    return { input, css: 'flex', rn: null, via: 'expand', detail: { cases: field.cases } };
  }
  const spelling = registry[field.prop];
  if (!spelling) {
    throw new Error(`[axis-doc] ${source}.${input}: canonical id '${field.prop}' has no property-spelling entry (registry drift)`);
  }
  const detail =
    field.via === 'scale' ? { scale: field.scale } :
    field.via === 'keyword' ? { map: field.map } :
    field.via === 'flag' ? { on: field.on, off: field.off } :
    {}; // literal · passthrough (the input value IS the property value)
  return { input, css: spelling.css, rn: spelling.rn, via: field.via, detail };
}

// ── palette ← the SURFACE role table (palette-surface.ts). variant XOR chrome →
// { bg?, fg, pressed? }, each paint resolved to a swatch. `roleColor` is the N+42
// colour resolver, re-keyed by the L2 role NAME (the SoT's `bg-strong` ≡ the var
// `--nuri-bg-strong` · docs.js#makeRoleResolver) → { var, hex }. The ONLY axis that
// resolves tokens to values (box/stack reference scale NAMES · resolved at A4c). ──
export function paletteAxisIr(surface, roleColor) {
  const dispatch = (table) =>
    Object.entries(table).map(([input, role]) => ({
      input,
      bg: channel(role.bg, roleColor),
      fg: channel(role.fg, roleColor),
      pressed: channel(role.pressed, roleColor),
    }));
  return { source: 'palette', kind: 'palette', variant: dispatch(surface.variant), chrome: dispatch(surface.chrome) };
}

// One paint → a channel cell IR. absent ⇒ null (fg-only `subtle` · the chrome
// slot's no-pressed); a { literal } paint (ghost's `transparent`) ⇒ { literal }
// (a bordered empty swatch · no hex); a bare role NAME ⇒ { role, var, hex } (a live
// var() swatch + the default-scope hex · the complete pair · palette-surface.ts).
function channel(paint, roleColor) {
  if (paint === undefined) return null;
  if (typeof paint === 'object') return { literal: paint.literal };
  const { var: cssVar, hex } = roleColor(paint);
  return { role: paint, var: cssVar, hex };
}

// ── interactive ← the EFFECT set (interactive-effects.ts). Per effect: the name,
// the ASSEMBLED selector (`.nuri-interactive` + the attr gate + the pseudo-state ·
// the comma list · the inverse-spelling of flattenPart's gate logic), the
// declarations, and the gate (automatic vs the `data-*` opt-in). The array order is
// LOAD-BEARING (pressScale strictly before disabledGuard · equal-specificity
// `transform` · source-order decides) — preserved here + surfaced as `order`. ──
const INTERACTIVE_BASE = '.nuri-interactive';

export function interactiveAxisIr(effects) {
  const rows = effects.map((e) => ({
    name: e.name,
    selector: e.on.map((p) => INTERACTIVE_BASE + (p.attr ?? '') + (p.state ?? '')).join(', '),
    decls: e.decls.map(([prop, value]) => [prop, value]),
    gate: gateOf(e),
  }));
  // The order-sensitive collision (the centerpiece · the brief §5): the effects
  // that BOTH set `transform` at equal specificity, in their emitted order. ≥2 ⇒
  // source order is load-bearing; the note documents exactly that collision.
  const order = effects.filter((e) => e.decls.some(([prop]) => prop === 'transform')).map((e) => e.name);
  return { source: 'interactive', kind: 'interactive', rows, order };
}

// The gate: opt-in iff the selector requires an author `data-*` attribute
// (`[data-press-scale]` · pressScale) — a STRUCTURAL read of the opt-in mechanism
// (the SoT comment confirms it). A runtime-STATE attr (`[aria-disabled="true"]`)
// is not an opt-in → automatic. Returns { kind:'automatic' } | { kind:'opt-in', attr }.
function gateOf(effect) {
  const optIn = effect.on.find((p) => p.attr && p.attr.startsWith('[data-'));
  return optIn ? { kind: 'opt-in', attr: optIn.attr } : { kind: 'automatic' };
}

// ── typography ← THREE surfaces (decision 77 · the de-fusion · §76 the §73 taxonomy
// refined: single-source ≠ shape). The axis the components compose is TWO orthogonal
// inputs (the button label is `typography: { size: 'md', emphasis: true }` · decision
// 55/77), realized on BOTH targets — the agnostic `| Input | Web | RN | Value |` grammar
// this spike LOCKS for the fan-out:
//   (a) `size`     — the 6 type-scale steps (xs · sm · md · lg · xl · 3xl), one row each
//                    (the per-value realization differs, so enumerate · unlike a fixed-
//                    property keyword field). Web a `[data-type-style="{size}"]` attr,
//                    RN `typeStyle(size)`. The Value REFERENCES the type SCALE composite
//                    (font-size/line-height/weight/tracking · Foundations · A4c · NOT
//                    restated here · the operator's no-overlap bar).
//   (b) `emphasis` — the orthogonal boolean (the de-fusion's WHOLE POINT · contrast the
//                    old fused `mdEm`): ONE row. Web a single presence rule
//                    [data-type-emphasis] → semibold, RN typeStyle's 2nd boolean arg.
// The realization SPELLING ([data-type-style] / [data-type-emphasis] / typeStyle) is the
// documented convention (mirrors styles/typography.css + theme.tsx#typeStyle · §77), not
// a re-derived mapping — the key IS the step IS the attr value (decision 55).
//   (c) wrapper    — the web-only `nuri-typography` element (muted + align · a REAL
//                    element, unlike palette/interactive's merged-node class). NO RN
//                    analog (RN inherits colour by scope, aligns on the Text node · §76).
export function typographyAxisIr(axis, typeSizes) {
  // (a) the agnostic size axis — the spike of the `| Input | Web | RN | Value |` grammar.
  const size = typeSizes.map((s) => ({
    input: s,
    web: `[data-type-style="${s}"]`,
    rn: `typeStyle('${s}')`,
  }));
  // (b) the orthogonal emphasis boolean — one row, the data-attr + the weight override.
  const emphasis = { input: 'emphasis', web: '[data-type-emphasis]', rn: 'typeStyle(size, true)', value: 'semibold' };
  // (c) the web-only wrapper dispatch (muted + align · unchanged · the real element).
  const wrapper = axis.dispatch.map((r) => ({
    name: r.name,
    selector: axis.element + r.attr,
    decls: r.decls.map(([prop, value]) => [prop, value]),
  }));
  return { source: 'typography', kind: 'typography', size, emphasis, element: axis.element, wrapper };
}

// ── The axis manifest — { source slug · nav_order · the SoT header path · the
// one-line lead · the IR builder }. @nuri/doc owns WHICH axes it documents + their
// nav order (the cascade: the 2 agnostic, then the 3 bespoke). `build(d)` is a pure
// function of the loaded-SoT data bag (build.js / Guard G feed the same `d`). ──
export const AXIS_DOCS = [
  {
    source: 'stack',
    nav: 1,
    src: 'packages/spec/pipeline/resolve-map.ts · property-spelling.ts',
    lead: 'The agnostic **stack** namespace — flexbox layout (direction · alignment · gap · wrap · fill) as a Field table: one mapping, both targets.',
    build: (d) => fieldsAxisIr('stack', d.stackFields, d.registry),
  },
  {
    source: 'box',
    nav: 2,
    src: 'packages/spec/pipeline/resolve-map.ts · property-spelling.ts',
    lead: 'The agnostic **box** namespace — geometry (sizing · padding · radii) as a Field table: one mapping, both targets.',
    build: (d) => fieldsAxisIr('box', d.boxFields, d.registry),
  },
  {
    source: 'palette',
    nav: 3,
    src: 'packages/spec/pipeline/palette-surface.ts',
    lead: 'The bespoke **palette** axis — the colour funnel: a surface role resolves a node’s complete pair (background + foreground) plus the optional pressed swap.',
    build: (d) => paletteAxisIr(d.surface, d.roleColor),
  },
  {
    source: 'interactive',
    nav: 4,
    src: 'packages/spec/pipeline/interactive-effects.ts',
    lead: 'The bespoke **interactive** axis — interaction decomposed into independent effects (affordance · focus · press-scale · disabled), each its own gate.',
    build: (d) => interactiveAxisIr(d.effects),
  },
  {
    source: 'typography',
    nav: 5,
    src: 'packages/spec/build/tokens.ts · packages/spec/styles/typography.css · packages/rn/theme.tsx · packages/spec/pipeline/typography-axis.ts',
    lead: 'The bespoke **typography** axis — two orthogonal inputs (decision 77): **`size`**, a foundation type-step, and **`emphasis`**, a boolean weight override. Both realize on either target (web a `data-*` attribute · RN `typeStyle`); each step’s resolved composite (font-size · line-height · weight · tracking) lives in the type **scale** (Foundations). The `nuri-typography` **wrapper** below is a separate **web-only** prose helper — muted tone + block alignment for authored content, with no RN analog.',
    build: (d) => typographyAxisIr(d.axis, d.typeSizes),
  },
];
