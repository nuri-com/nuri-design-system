/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · NAMESPACE CSS EMIT (the L3.1 reversible spike · decision 70)
 * ──────────────────────────────────────────────────────────────────
 * Field table → the web namespace CSS. This is the web emit that S1 promised
 * ("three platforms, one table — RN → ViewStyle · web → CSS · CSS → a rule")
 * but never built — S3 reused the hand CSS (Option A) instead, "which is where
 * the model got lost" (docs/cascade.md · L3 step 1).
 *
 * It consumes the SAME Field table the RN applier consumes
 * (packages/rn/factory/resolve-map.ts · STACK_FIELDS/BOX_FIELDS) and emits the
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
 * mapping; the per-target EMIT supplies the property SPELLING + the bits the
 * table (designed RN-first) does not yet carry. This spike SURFACES exactly
 * what those bits are — each is a known cascade.md item, flagged for the L3 flip:
 *
 *   1. LOGICAL_OVERRIDES — the RN physical prop → web LOGICAL property remap.
 *      Broader than the doc's lone `paddingHorizontal→padding-inline` example:
 *      sizing (width→inline-size · height→block-size · minHeight→min-block-size)
 *      AND every padding edge go logical for writing-mode / RTL coherence (the
 *      hand box.css choice · box.tsx maps them back to physical for Yoga). The
 *      rest is mechanical camelCase→kebab (flexDirection→flex-direction, …).
 *   2. SCALE_VOCAB — the per-field accepted leaves. `size`/`radius` DERIVE from
 *      the token scale (the SizeLeaf model · Object-keys of the scale); `space`
 *      is the CURATED 5-leaf subset (SpaceLeaf ⊊ space — none/2xs/2xl have no
 *      prop surface). That curation is the cascade.md "SpaceLeaf hardcoded ·
 *      a double declaration to remove" — today it lives ONLY as an erased TS
 *      type (schema.ts), so the spike must restate it (SPACE_LEAF below).
 *   3. LITERAL_VOCAB — a `literal` field is value-passthrough; the table names
 *      no vocabulary (RN passes the runtime value straight through). The web
 *      must ENUMERATE the inputs → `direction: row|column` (also erased schema).
 *   4. EXPAND_WEB — the `expand` arm's web declarations. The RN cases are a
 *      ViewStyle object ({flexGrow:1,flexShrink:0}); the hand CSS writes the
 *      `flex` shorthand (`1 0 auto`) + a LOGICAL min-size (min-inline-size:0,
 *      not RN's physical minWidth). Not mechanically derivable → per-target.
 *
 * The vocabulary for the OTHER arms rides the table itself: `keyword`
 * (ALIGN/JUSTIFY map keys+values), `flag` (on/off). So the supplement is
 * minimal — and every gap is a cascade.md-named L3-flip TODO, not a surprise.
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
 * ── THE TABLE IS MIS-HOMED (the spike shim) ────────────────────────────
 * resolve-map.ts lives in @nuri/rn; cascade.md: "the axis SoT belongs in
 * @nuri/spec" (the decision-68 rn→spec DAG · today backwards). This module
 * reads it cross-package + TYPE-STRIPS it (node 20 cannot import .ts · same
 * constraint that drives the descriptor browser-ESM twins). That read is the
 * spike's TEMPORARY shim — the L3 flip RELOCATES the table to @nuri/spec, and
 * this becomes a local import (the sub-decision: in-place now, relocate then).
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

// ── 1 · LOGICAL_OVERRIDES · RN physical prop → web logical property ──
// Everything not listed falls back to mechanical camelCase→kebab (webProp).
const LOGICAL_OVERRIDES = {
  // box sizing → logical (the hand box.css · RTL/writing-mode coherent)
  width: 'inline-size',
  height: 'block-size',
  minHeight: 'min-block-size',
  // box padding → logical (paddingHorizontal→padding-inline is the doc example;
  // the full edge set follows the same rule)
  paddingHorizontal: 'padding-inline',
  paddingVertical: 'padding-block',
  paddingStart: 'padding-inline-start',
  paddingEnd: 'padding-inline-end',
  paddingTop: 'padding-block-start',
  paddingBottom: 'padding-block-end',
};

// ── 2 · the SpaceLeaf curation (cascade.md "double declaration to remove") ──
// The 5 of the space scale's 8 leaves the layout primitives expose (schema.ts
// SpaceLeaf · none/2xs/2xl have no prop dispatch). `size`/`radius` need no such
// list — their FULL scale IS the vocab (derived in readScaleVocab).
const SPACE_LEAF = ['xs', 'sm', 'md', 'lg', 'xl'];

// ── 3 · LITERAL_VOCAB · the enumerable inputs for a passthrough `literal` field ──
const LITERAL_VOCAB = {
  direction: ['row', 'column'], // StackNS['direction'] (erased) · hand order
};

// ── 4 · EXPAND_WEB · the `expand` arm's per-target web declarations ──
// Keyed by the field key, then by the TABLE's case key (the vocab still comes
// from the table · a case without a web spelling throws). Decls as [prop, value].
const EXPAND_WEB = {
  fill: {
    grow: [['flex', '1 0 auto']], // RN {flexGrow:1,flexShrink:0} → the shorthand
    'grow-shrink': [['flex', '1 1 auto'], ['min-inline-size', '0']], // logical, not RN's minWidth
  },
};

// ── camelCase → kebab-case (the mechanical half of the spelling) ──
// minHeight→min-height (data attr) · flexDirection→flex-direction (prop) ·
// paddingX→padding-x. Matches the web factory's camelToKebab (factory.js).
const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

// RN ViewStyle prop → web CSS property: a logical override, else kebab.
const webProp = (prop) => LOGICAL_OVERRIDES[prop] ?? kebab(prop);

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
    pre: [
      { sel: 'nuri-box', decls: [['display', 'contents']] },
      { sel: 'nuri-box:not(:defined)', decls: [['display', 'block']] },
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
function rulesForField(ns, key, field, scaleVocab) {
  const sel = (v) => selectorFor(ns, key, v);
  const prop = field.prop !== undefined ? webProp(field.prop) : undefined;
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
export function emitNamespaceCss({ ns, title, fields, scaleVocab }) {
  const shell = SHELLS[ns];
  if (!shell) throw new Error(`[namespace-css] no shell for namespace '${ns}'`);

  const fieldRules = [];
  for (const key of Object.keys(fields)) {
    fieldRules.push(...rulesForField(ns, key, fields[key], scaleVocab));
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
    ` * GENERATED from the Field table (packages/rn/factory/resolve-map.ts ·`,
    ` * ${ns === 'box' ? 'BOX_FIELDS' : 'STACK_FIELDS'}) + the web spelling layer (pipeline/parsers/namespace-css.js)`,
    ` * by pipeline/css-preview.js, wired into npm run build (pipeline/tokens-parser.js`,
    ` * · the namespace-CSS slice · regenerates IN PLACE over this file). This is the`,
    ` * LIVE namespace CSS — the pages link it and the web factory (lib/runtime/`,
    ` * factory.js) styles the nuri-* merged nodes with it. decision 2 reversed for the`,
    ` * namespace layer (decision 74 · executing decision 70 · the L3c flip · N+38):`,
    ` * the hand SoT retired here (git-recoverable) and the generator is the sole`,
    ` * source. Re-run npm run build (or node pipeline/css-preview.js) to regenerate;`,
    ` * freshness gated by pipeline/css-preview.test.js.`,
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
  const found = { space: [], size: [], radius: [] };
  const re = /--nuri-(space|size|radius)-([a-z0-9]+)\s*:/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const [, scale, leaf] = m;
    if (!found[scale].includes(leaf)) found[scale].push(leaf);
  }
  for (const scale of ['space', 'size', 'radius']) {
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
  return {
    space: SPACE_LEAF.filter((l) => found.space.includes(l)),
    size: found.size,
    radius: found.radius,
  };
}

// ══════════════════════════════════════════════════════════════════
// loadFieldTable · read + type-strip resolve-map.ts → { STACK_FIELDS, BOX_FIELDS }
// ══════════════════════════════════════════════════════════════════
// The spike shim (see header): node 20 cannot import the .ts SoT, so we read it
// as text, strip the TS apparatus (the SAME technique as the descriptor browser-
// ESM twins · emitDescriptorJsFromSource), and import the resulting self-
// contained ESM via a data: URL (resolve-map.ts has only `import type` imports,
// so the stripped module needs no module resolution). The L3 flip relocates the
// table to @nuri/spec and this becomes a plain import.

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

// The two namespace specs the spike generates — the "clearly-tabular agnostic
// two" (box · stack · the ship list). typography is NOT here: it is not a Field-
// table namespace (resolve.ts handles it bespoke as a type-STEP ref · not a
// ViewStyle prop), so it does not fit the table cleanly → deferred to L3.1b
// (the sub-decision). palette + interactive are bespoke → L3b.
export const NS_SPECS = [
  { ns: 'box', title: 'BOX', fieldsKey: 'BOX_FIELDS' },
  { ns: 'stack', title: 'STACK', fieldsKey: 'STACK_FIELDS' },
];
