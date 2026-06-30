/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · NAMESPACE CSS EMIT (the L3.1 reversible spike · decision 70)
 * ──────────────────────────────────────────────────────────────────
 * Field table → the web namespace CSS. This is the web emit that S1 promised
 * ("three platforms, one table — RN → ViewStyle · web → CSS · CSS → a rule")
 * but never built — S3 reused the hand CSS (Option A) instead, "which is where
 * the model got lost" (docs/cascade.md · L3 step 1).
 *
 * It consumes the SAME Field table the RN applier consumes
 * (packages/spec/pipeline/resolve-map.ts · STACK_FIELDS/BOX_FIELDS) and emits the
 * flat `[data-*]` dispatch CSS — the inverse-spelling of `applyFields`
 * (resolve.ts): the RN emit writes `ViewStyle[prop] = value`; this writes
 * `.nuri-<ns>[data-<kebab key>="<v>"] { <web prop>: <web value>; }`.
 *
 * REVERSIBLE SPIKE · SHADOW ONLY (decision 70 · the L3 analog of B1/B2a):
 * generates to build/css-preview/, proven ≡ the hand lib/components/<ns>/<ns>.css
 * (the parity oracle), flips/retires NOTHING. NOT wired into `npm run build`;
 * the live namespace CSS, the web factory, and the recipe layer are untouched.
 *
 * ── THE WEB SPELLING LAYER (the per-target delta · cascade.md "+ its own
 *    spelling") ──────────────────────────────────────────────────────────
 * The shared table carries the field → { via, property-CONCEPT, value-SOURCE }
 * mapping (the concept is a CANONICAL id); the per-target EMIT supplies the
 * property NAME + the vocab/value bits the table does not carry.
 *
 *   · The property NAME is single-sourced in the property-spelling registry
 *     (property-spelling.ts · loadRegistry · the `.css` column · decision 73
 *     cl.2). It REPLACED the old LOGICAL_OVERRIDES + webProp re-spelling — the
 *     canonical id IS the CSS-logical concept (paddingInline → padding-inline ·
 *     inlineSize → inline-size), so the web emit just reads `.css`.
 *
 * What REMAINS per-target here (the bits the registry does NOT carry):
 *   1. SCALE_VOCAB — the per-field accepted leaves. `size`/`radius` DERIVE from
 *      the token scale (the SizeLeaf model · Object-keys of the scale); `space`
 *      is the CURATED 5-leaf subset (SpaceLeaf ⊊ space — none/2xs/2xl have no
 *      prop surface). That curation is the cascade.md "SpaceLeaf hardcoded ·
 *      a double declaration to remove" — today it lives ONLY as an erased TS
 *      type (schema.ts), so this restates it (SPACE_LEAF below).
 *   2. LITERAL_VOCAB — a `literal` field is value-passthrough; the table names
 *      no vocabulary (RN passes the runtime value straight through). The web
 *      must ENUMERATE the inputs → `direction: row|column` (also erased schema).
 *   3. EXPAND_WEB — the `expand` arm's web declarations. The RN cases are a
 *      multi-prop fragment ({flexGrow:1,flexShrink:0}); the CSS writes the `flex`
 *      shorthand (`1 0 auto`) + a LOGICAL min-size (min-inline-size:0, not RN's
 *      physical minWidth). A mechanism difference, not a name → NOT a registry
 *      entry (decision 73 cl.2), so its web spelling stays here.
 *
 * The vocabulary for the OTHER arms rides the table itself: `keyword`
 * (ALIGN/JUSTIFY map keys+values), `flag` (on/off). So the supplement is minimal.
 *
 * ── THE SHELL ──────────────────────────────────────────────────────────
 * Each namespace CSS also carries non-field STRUCTURAL boilerplate — the
 * custom-element wrapper (display:contents), the pre-upgrade skeleton
 * (:not(:defined)), the variant-agnostic base, and box's `data-center` auto
 * margin. These are NOT field mappings (the thing the table de-duplicates);
 * they are irreducible per-namespace structure. The emitter owns them (PRE/POST
 * shells below · mirrored from the hand <ns>.css); at the L3 flip the hand CSS
 * retires and the emitter is the sole source (the B1 discipline).
 *
 * ── THE TABLE + REGISTRY ARE HOMED IN @nuri/spec (N+39 · the rn→spec DAG) ──
 * resolve-map.ts + property-spelling.ts now live in @nuri/spec's pipeline/
 * (decision 73 cl.2 / 74 · convergence `final`) — the axis SoT was mis-homed in
 * @nuri/rn through the shadow phase (the decision-68 rn→spec DAG, finally right
 * way round). This module reads both in place + TYPE-STRIPS them (node 20 cannot
 * import .ts · same constraint as the descriptor browser-ESM twins); @nuri/rn
 * imports them as plain typed modules via the exports map. The codegen-vs-data
 * home re-org is convergence phase 4.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

// The shared type-strip (decision 48 · one strip impl) — used to load the
// property-spelling registry (.ts SoT · authored in the strip-trivial
// `as const satisfies` style · like palette-surface.ts). resolve-map.ts keeps
// its own bespoke strip below (its tagged-union + typed-const style needs it).
import { stripTypes as stripTypesShared } from './strip.js';

// ── 1 · the SpaceLeaf curation (cascade.md "double declaration to remove") ──
// The 5 of the space scale's 8 leaves the layout primitives expose (schema.ts
// SpaceLeaf · none/2xs/2xl have no prop dispatch). `size`/`radius` need no such
// list — their FULL scale IS the vocab (derived in readScaleVocab).
const SPACE_LEAF = ['xs', 'sm', 'md', 'lg', 'xl'];

// ── 2 · LITERAL_VOCAB · the enumerable inputs for a passthrough `literal` field ──
const LITERAL_VOCAB = {
  direction: ['row', 'column'], // StackNS['direction'] (erased) · hand order
};

// ── 3 · EXPAND_WEB · the `expand` arm's per-target web declarations ──
// Keyed by the field key, then by the TABLE's case key (the vocab still comes
// from the table · a case without a web spelling throws). Decls as [prop, value].
const EXPAND_WEB = {
  fill: {
    grow: [['flex', '1 0 auto']], // RN {flexGrow:1,flexShrink:0} → the shorthand
    'grow-shrink': [['flex', '1 1 auto'], ['min-inline-size', '0']], // logical, not RN's minWidth
    even: [['flex', '1 1 0'], ['min-inline-size', '0']], // basis-0 equal split (the topbar edges)
  },
};

// ── camelCase → kebab-case · the data-ATTR spelling only ──
// The merged-node dispatch keys on the namespace INPUT key (paddingX→data-padding-x ·
// minHeight→data-min-height). The CSS PROPERTY name is NO LONGER derived here — it
// comes from the property-spelling registry (property-spelling.ts · the `.css`
// column · decision 73 cl.2), which replaced the old LOGICAL_OVERRIDES + webProp.
const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

// the merged-node dispatch selector for one (namespace, field, value) cell.
const selectorFor = (ns, key, value) => `.nuri-${ns}[data-${kebab(key)}="${value}"]`;

// ══════════════════════════════════════════════════════════════════
// THE SHELLS · non-field structural boilerplate (mirrored from hand <ns>.css)
// ══════════════════════════════════════════════════════════════════
// A rule = { sel, decls: [[prop, value], …] }. Emitted verbatim around the
// field-driven dispatch. Owned by the emitter (NOT the table) — see the header.

const SHELLS = {
  stack: {
    pre: [
      { sel: 'nuri-stack', decls: [['display', 'contents']] },
      { sel: 'nuri-stack:not(:defined)', decls: [['display', 'flex'], ['flex-direction', 'column']] },
      { sel: 'nuri-stack:not(:defined)[direction="row"]', decls: [['flex-direction', 'row']] },
      { sel: '.nuri-stack', decls: [['display', 'flex'], ['flex-direction', 'column'], ['min-width', '0']] },
    ],
    post: [],
  },
  box: {
    // The `<nuri-box>` standalone ELEMENT retired (the §1.B fold · box.js deleted ·
    // its geometry already lands on the merged `View` node). Only the box NAMESPACE
    // survives — the `.nuri-box[data-*]` dispatch + the `.nuri-box` base — applied
    // programmatically by the web factory + the icon. So NO element-host shell here
    // (no `nuri-box { display:contents }` / `:not(:defined)` skeleton — there is no
    // element left to upgrade); just the namespace base.
    pre: [
      { sel: '.nuri-box', decls: [['min-width', '0']] },
    ],
    // `center` is NOT a BOX_FIELDS member (RN handles it in box.tsx) — a box-
    // specific shell extra, emitted after the field dispatch (the hand order).
    post: [
      { sel: '.nuri-box[data-center="true"]', decls: [['margin-inline', 'auto']] },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════
// THE FIELD → RULES emit (one Field → its [data-*] dispatch rules)
// ══════════════════════════════════════════════════════════════════
// The inverse-spelling of applyFields (resolve.ts): each arm enumerates the
// field's vocabulary and writes one rule per value. Exhaustive over the Field
// union — an unhandled `via` throws (the assertNever analogue · resolve.ts).
function rulesForField(ns, key, field, scaleVocab, registry) {
  const sel = (v) => selectorFor(ns, key, v);
  // The CSS PROPERTY name is the registry's `.css` for the field's canonical id
  // (single-sourced spelling · decision 73 cl.2). `expand` carries no `prop` (its
  // web decls live in EXPAND_WEB). A canonical id absent from the registry is a
  // strip/registry regression → throw (the spelling analogue of assertNever).
  let prop;
  if (field.prop !== undefined) {
    const entry = registry[field.prop];
    if (!entry || entry.css === undefined) {
      throw new Error(`[namespace-css] ${ns}.${key}: canonical id '${field.prop}' has no property-spelling registry entry`);
    }
    prop = entry.css;
  }
  switch (field.via) {
    case 'scale': {
      const vocab = scaleVocab[field.scale];
      if (!vocab) throw new Error(`[namespace-css] ${ns}.${key}: no scale vocab for '${field.scale}'`);
      return vocab.map((leaf) => ({ sel: sel(leaf), decls: [[prop, `var(--nuri-${field.scale}-${leaf})`]] }));
    }
    case 'keyword':
      // vocab + values both ride the table's map (no supplement needed).
      return Object.entries(field.map).map(([inK, outV]) => ({ sel: sel(inK), decls: [[prop, outV]] }));
    case 'literal': {
      const vocab = LITERAL_VOCAB[key];
      if (!vocab) throw new Error(`[namespace-css] ${ns}.${key}: 'literal' field has no LITERAL_VOCAB (web cannot enumerate a passthrough)`);
      return vocab.map((v) => ({ sel: sel(v), decls: [[prop, v]] }));
    }
    case 'flag':
      // only the `on` case emits a rule — `off` is the CSS default (the hand
      // wrap rule is `[data-wrap="true"] { flex-wrap: wrap }` only).
      return [{ sel: sel('true'), decls: [[prop, field.on]] }];
    case 'expand': {
      const web = EXPAND_WEB[key];
      if (!web) throw new Error(`[namespace-css] ${ns}.${key}: 'expand' field has no EXPAND_WEB spelling`);
      // iterate the TABLE's case keys (the vocab) → look up the web decls.
      return Object.keys(field.cases).map((caseKey) => {
        const decls = web[caseKey];
        if (!decls) throw new Error(`[namespace-css] ${ns}.${key}: expand case '${caseKey}' has no web spelling in EXPAND_WEB`);
        return { sel: sel(caseKey), decls };
      });
    }
    default:
      throw new Error(`[namespace-css] ${ns}.${key}: unhandled via '${field.via}'`);
  }
}

// ── serialize a rule list → CSS text (indented inside @layer rules) ──
function serializeRule({ sel, decls }) {
  const body = decls.map(([p, v]) => `${p}: ${v};`).join(' ');
  return `  ${sel} { ${body} }`;
}

// ══════════════════════════════════════════════════════════════════
// emitNamespaceCss · one namespace spec → the full shadow CSS file
// ══════════════════════════════════════════════════════════════════
// spec = { ns, title, fields, scaleVocab }. Layout: provenance header +
// empty `@layer tokens` (mirrors hand · layout primitives alias no token) +
// `@layer rules` { pre-shell · field dispatch (table order) · post-shell }.
export function emitNamespaceCss({ ns, title, fields, scaleVocab, registry }) {
  const shell = SHELLS[ns];
  if (!shell) throw new Error(`[namespace-css] no shell for namespace '${ns}'`);

  const fieldRules = [];
  for (const key of Object.keys(fields)) {
    fieldRules.push(...rulesForField(ns, key, fields[key], scaleVocab, registry));
  }

  const ruleLines = [
    ...shell.pre.map(serializeRule),
    ...fieldRules.map(serializeRule),
    ...shell.post.map(serializeRule),
  ];

  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · NAMESPACE CSS · ${title} · GENERATED — DO NOT EDIT BY HAND`,
    ` *`,
    ` * GENERATED from the Field table (packages/spec/pipeline/resolve-map.ts ·`,
    ` * ${ns === 'box' ? 'BOX_FIELDS' : 'STACK_FIELDS'}) + the web spelling layer`,
    ` * (prototype/pipeline/parsers/namespace-css.js) by prototype/pipeline/css-preview.js,`,
    ` * wired into npm run build -w @nuri/prototype (its own build · regenerates IN PLACE`,
    ` * over this file · prototype/styles/${ns}.css). This is the LIVE namespace CSS — the`,
    ` * pages link it and the web factory (prototype/factory/factory.js) styles the nuri-*`,
    ` * merged nodes with it. decision 2 reversed for the namespace layer (decision 74 ·`,
    ` * executing decision 70 · the L3c flip · N+38 · carved to @nuri/prototype at N+41):`,
    ` * the hand SoT retired (git-recoverable) and the generator is the sole source. Re-run`,
    ` * npm run build -w @nuri/prototype to regenerate; freshness gated by`,
    ` * prototype/pipeline/css-preview.test.js.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `@layer tokens {`,
    `  /* Empty by design (decision 37 · layout primitives parametrize semantic`,
    `   * vocabulary via prop, not via component-token aliasing). Mirrors the hand`,
    `   * ${ns}.css. */`,
    `}`,
    ``,
    `@layer rules {`,
    ruleLines.join('\n'),
    `}`,
    ``,
  ].join('\n');
}

// ══════════════════════════════════════════════════════════════════
// readScaleVocab · the per-scale leaf vocabulary, derived from the token scale
// ══════════════════════════════════════════════════════════════════
// Reads the semantic scale leaf KEYS from styles/tokens-semantic.css (the L2
// CSS SoT · where --nuri-{space,size,radius}-<leaf> live · node 20 cannot import
// the build/tokens.ts scale objects). `size`/`radius` use the FULL scale (the
// SizeLeaf "derive from the scale" model); `space` is curated to SPACE_LEAF.
// Post-L2-flip this reads the authored TS scale directly — the derivation, not
// the source, is the point. Returns { space, size, radius } as ordered arrays.
export async function readScaleVocab(semanticCssPath) {
  const css = await readFile(semanticCssPath, 'utf8');
  const found = { space: [], size: [], radius: [], ratio: [] };
  const re = /--nuri-(space|size|radius|ratio)-([a-z0-9]+)\s*:/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const [, scale, leaf] = m;
    if (!found[scale].includes(leaf)) found[scale].push(leaf);
  }
  for (const scale of ['space', 'size', 'radius', 'ratio']) {
    if (found[scale].length === 0) {
      throw new Error(`[namespace-css] readScaleVocab: no --nuri-${scale}-* leaves in ${semanticCssPath}`);
    }
  }
  // Curate space to the layout-primitive subset (SpaceLeaf) · assert all present
  // so a scale rename surfaces here, not as a silent missing rule.
  const missing = SPACE_LEAF.filter((l) => !found.space.includes(l));
  if (missing.length) {
    throw new Error(`[namespace-css] readScaleVocab: SPACE_LEAF ${missing.join(', ')} absent from the space scale`);
  }
  // size/radius/ratio use the FULL scale (the SizeLeaf "derive from the scale" model ·
  // ratio has no curated subset · both leaves dispatch).
  return {
    space: SPACE_LEAF.filter((l) => found.space.includes(l)),
    size: found.size,
    radius: found.radius,
    ratio: found.ratio,
  };
}

// ══════════════════════════════════════════════════════════════════
// loadFieldTable · read + type-strip resolve-map.ts → { STACK_FIELDS, BOX_FIELDS }
// ══════════════════════════════════════════════════════════════════
// node 20 cannot import the .ts SoT, so we read it as text, strip the TS apparatus
// (the SAME technique as the descriptor browser-ESM twins · emitDescriptorJsFromSource),
// and import the resulting self-contained ESM via a data: URL (resolve-map.ts has
// only `import type` imports, so the stripped module needs no module resolution).
// The table now lives in @nuri/spec's pipeline/ (N+39 · the rn→spec DAG); the RN
// side became a plain import, but this web read stays type-stripped (node 20 · .ts).

// Strip the four TS constructs resolve-map.ts uses (and ONLY those):
//   · `import type …;`            (the 2 type-only imports → no runtime dep)
//   · `export type ScaleName …;`  (single-line)
//   · `export type Field = …;`    (the multi-line tagged union · `  | …` arms)
//   · `const X: <Type> = `        (annotations on the 5 data consts)
export function stripTypes(src) {
  return src
    .replace(/^import type .*;\n/gm, '')
    .replace(/^export type ScaleName = .*;\n/m, '')
    .replace(/^export type Field =\n(?:\s*\|.*\n)*/m, '')
    .replace(/^((?:export )?const \w+): [^=\n]+ = /gm, '$1 = ');
}

export async function loadFieldTable(resolveMapPath) {
  const src = await readFile(resolveMapPath, 'utf8');
  const stripped = stripTypes(src);
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripped));
  // Sanity — a strip regression must fail LOUD here, not silently emit garbage.
  for (const name of ['STACK_FIELDS', 'BOX_FIELDS']) {
    if (!mod[name] || typeof mod[name] !== 'object' || !Object.keys(mod[name]).length) {
      throw new Error(`[namespace-css] loadFieldTable: stripped resolve-map has no usable ${name} (strip regression?)`);
    }
  }
  return { STACK_FIELDS: mod.STACK_FIELDS, BOX_FIELDS: mod.BOX_FIELDS };
}

// ══════════════════════════════════════════════════════════════════
// loadRegistry · read + type-strip property-spelling.ts → PROPERTY_SPELLING
// ══════════════════════════════════════════════════════════════════
// The property-spelling registry (canonical id → { rn, css } · decision 73 cl.2)
// supplies the per-target property NAME the field's canonical id resolves to. Like
// the siblings (loadSurface/loadEffects/loadAxis), it is type-stripped + data:-URL
// imported (node 20 · .ts) — but via the SHARED stripTypes (dimension-css.js · the
// registry is authored in the `as const satisfies <named type>` style, NOT the
// resolve-map tagged-union style the bespoke strip above targets). The web emit
// reads `.css`; `.rn` is the RN applier's column (resolve.ts · unused here).
export async function loadRegistry(registryTsPath) {
  const src = await readFile(registryTsPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripTypesShared(src)));
  const reg = mod.PROPERTY_SPELLING;
  // Sanity — a strip regression must fail LOUD here (a known entry resolves to {css}).
  if (!reg || typeof reg !== 'object' || !reg.padding || reg.padding.css === undefined) {
    throw new Error('[namespace-css] loadRegistry: PROPERTY_SPELLING missing/empty or lacks {css} entries (strip regression?)');
  }
  return reg;
}

// The two namespace specs the spike generates — the "clearly-tabular agnostic
// two" (box · stack · the ship list). typography is NOT here: it is not a Field-
// table namespace (resolve.ts handles it bespoke as a type-STEP ref · not a
// ViewStyle prop), so it does not fit the table cleanly → deferred to L3.1b
// (the sub-decision). palette + interactive are bespoke → L3b.
export const NS_SPECS = [
  { ns: 'box', title: 'BOX', fieldsKey: 'BOX_FIELDS' },
  { ns: 'stack', title: 'STACK', fieldsKey: 'STACK_FIELDS' },
];
