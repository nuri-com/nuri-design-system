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
 *   · interactive  ← interactive-effects.ts (opts) + prototype's web projection → the
 *                    agnostic opt-in set (web realization · RN realization · gate · the
 *                    Input|Web|RN|Value grammar) + the demoted web-only chrome section.
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

// ── interactive ← the agnostic spec opts + prototype-owned web projection. The page
// splits into the agnostic axis (the opts, on the locked `| Input | Web | RN | Value |`
// grammar) + the demoted web-only chrome:
//   · opts   — per opt-in: the input key · the WEB realization (the assembled selector
//              + decls · `{ palette: true }` where the rule lives in palette ·
//              pressColor's pressed bg-swap) · the RN realization spelled from the pure
//              `rn` data (the documented convention · NOT re-derived) · the gate
//              (`'auto'` ⇒ automatic · else the `[data-<gate>]` opt-in).
//   · chrome — the webChrome rows (affordance · focus · disabledGuard): assembled
//              selector + decls. No agnostic input · no RN analog → web-only (demoted).
//   · order  — webOrder ∩ the transform-setters (pressScale before disabledGuard ·
//              equal-specificity `transform` · source-order decides) → the demoted
//              order caption in the chrome section (the N+46 demotion precedent). ──
const INTERACTIVE_BASE = '.nuri-interactive';

// a rule's selector PARTS → the assembled `.nuri-interactive`+attr+state comma list
// (the inverse-spelling of flattenPart's gate logic · mirrors interactive-css.js).
const assembleSelector = (on) => on.map((p) => INTERACTIVE_BASE + (p.attr ?? '') + (p.state ?? '')).join(', ');

// the RN realization spelled from the pure `rn` data (the documented convention · §76 ·
// NOT re-derived): `{ prop, from }` reads from the resolved node (pressColor → pressedBg);
// `{ prop, token }` is the theme constant; `shape:'scale'` wraps it as RN's transform.
function rnSpelling(rn) {
  if (rn.shape === 'scale') return `${rn.prop}: [{ scale }] ← ${rn.token}`;
  if (rn.token !== undefined) return `${rn.prop} ← ${rn.token}`;
  return `${rn.prop} ← ${rn.from}`;
}

export function interactiveAxisIr(opts, interactiveWeb) {
  const { optRules, webChrome, webOrder } = interactiveWeb;
  const optRows = Object.entries(opts).map(([input, opt]) => ({
    input,
    web: optRules[input]
      ? { selector: assembleSelector(optRules[input].on), decls: optRules[input].decls.map(([prop, value]) => [prop, value]) }
      : { palette: true },
    rn: rnSpelling(opt.rn),
    gate: opt.gate === 'auto' ? { kind: 'automatic' } : { kind: 'opt-in', attr: `[data-${opt.gate}]` },
  }));
  const chrome = Object.entries(webChrome).map(([name, rule]) => ({
    name,
    selector: assembleSelector(rule.on),
    decls: rule.decls.map(([prop, value]) => [prop, value]),
  }));
  // The order-sensitive collision (the centerpiece · demoted to a chrome caption): the
  // webOrder entries that BOTH set `transform` at equal specificity, in emit order. ≥2 ⇒
  // source order is load-bearing (pressScale before disabledGuard · a disabled control
  // never scales). Resolved from webChrome (chrome rule) or optRules[name] (opt rule).
  const ruleFor = (name) => webChrome[name] ?? optRules[name];
  const order = webOrder.filter((name) => {
    const rule = ruleFor(name);
    return rule && rule.decls.some(([prop]) => prop === 'transform');
  });
  return { source: 'interactive', kind: 'interactive', opts: optRows, chrome, order };
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
export function typographyAxisIr(axis, typeSizes, typographyWeb) {
  // (a) the agnostic size axis — the spike of the `| Input | Web | RN | Value |` grammar.
  const size = typeSizes.map((s) => ({
    input: s,
    web: `[data-type-style="${s}"]`,
    rn: `typeStyle('${s}')`,
  }));
  // (b) the orthogonal emphasis boolean — one row, the data-attr + the weight override.
  const emphasis = { input: 'emphasis', web: '[data-type-emphasis]', rn: 'typeStyle(size, true)', value: 'semibold' };
  // (c) the web-only wrapper dispatch (muted + align · projected from neutral spec data).
  const wrapper = typographyWeb.dispatch.map((r) => ({
    name: r.name,
    selector: r.selector,
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
    src: 'packages/spec/axes/resolve-map.ts · property-spelling.ts',
    lead: 'The agnostic **stack** namespace — flexbox layout (direction · alignment · gap · wrap · fill) as a Field table: one mapping, both targets.',
    build: (d) => fieldsAxisIr('stack', d.stackFields, d.registry),
  },
  {
    source: 'box',
    nav: 2,
    src: 'packages/spec/axes/resolve-map.ts · property-spelling.ts',
    lead: 'The agnostic **box** namespace — geometry (sizing · padding · radii) as a Field table: one mapping, both targets.',
    build: (d) => fieldsAxisIr('box', d.boxFields, d.registry),
  },
  {
    source: 'palette',
    nav: 3,
    src: 'packages/spec/axes/palette-surface.ts',
    lead: 'The bespoke **palette** axis — the colour funnel: a surface role resolves a node’s complete pair (background + foreground) plus the optional pressed swap.',
    build: (d) => paletteAxisIr(d.surface, d.roleColor),
  },
  {
    source: 'interactive',
    nav: 4,
    src: 'packages/spec/axes/interactive-effects.ts',
    lead: 'The bespoke **interactive** axis — interaction decomposed into independent opt-ins (`pressColor` · `pressScale` · `disabledOpacity`), each one source realized on both targets: RN in production, web for prototyping and these docs. The `nuri-interactive` **chrome** below (affordance · focus · the disabled guard) is web-only realization support, not part of the axis.',
    build: (d) => interactiveAxisIr(d.opts, d.interactiveWeb),
  },
  {
    source: 'typography',
    nav: 5,
    src: 'packages/rn/generated/data/tokens.ts · packages/prototype/generated/styles/typography.css · packages/rn/theme.tsx · packages/spec/axes/typography-axis.ts',
    lead: 'The bespoke **typography** axis — two orthogonal inputs (decision 77): **`size`**, a foundation type-step, and **`emphasis`**, a boolean weight override. Both realize on either target (web a `data-*` attribute · RN `typeStyle`); each step’s resolved composite (font-size · line-height · weight · tracking) lives in the type **scale** (Foundations). The `nuri-typography` **wrapper** below is a separate **web-only** prose helper — muted tone + block alignment for authored content, with no RN analog.',
    build: (d) => typographyAxisIr(d.axis, d.typeSizes, d.typographyWeb),
  },
];
