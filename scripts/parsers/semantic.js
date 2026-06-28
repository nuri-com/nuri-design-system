/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · SEMANTIC
 * Walks the cascade blocks of styles/tokens-semantic.css and
 * resolves every semantic token to a literal per (accent × theme)
 * by chasing var() chains through a primitive map built from
 * styles/tokens-primitive.css.
 *
 * Companion to the browser parser at lib/docs/tokens.js#parseSemantics
 * — same cascade model (port of selectorMatches + findReference),
 * Node side has no DOM so we chain through a Map instead of
 * getComputedStyle. See AGENTS.md "Cascade ordering ·
 * tokens-semantic.css" and decisionlog.md decision 9.
 *
 * Emitter shape derivation (N+5.5 · approach D, classify-by-cascade):
 * the shape of each tokens.ts export is derived from *which* [data-*]
 * blocks declare a var, not from a hardcoded list. A var declared
 * under [data-theme="…"] only is chrome (Record<Theme, …>); a var
 * declared under [data-accent="…"][data-theme="…"] is accent
 * (Record<Accent, Record<Theme, …>>); a future var declared under
 * [data-font="…"]/etc. would auto-discover a new signature, fail the
 * GROUP_NAMES-exhaustive test until a group name is registered, and
 * then mechanically extend the nesting depth. No hardcoded export
 * list to drift; no per-shape branch in the emitter.
 *
 * Default neutral is cream (decision 31) — selectable at build time
 * via the orchestrator's --neutral=<scale> CLI flag. At N+32 C1 the
 * runtime data-neutral switcher RETIRED: the chosen neutral is now baked
 * into ONE :root resolution block in tokens-primitive.css (build-time only ·
 * pipeline/parsers/colour-css.js), driving BOTH the web CSS and what
 * tokens.ts emits for RN.
 * ────────────────────────────────────────────────────────────── */

import postcss from 'postcss';

import { inferType } from './primitive.js';

// Build defaults · single source of truth for the cross-product axes.
export const ACCENTS = ['neutral', 'lilac'];
export const THEMES = ['light', 'dark'];

// Selectable neutral scales for the --neutral=<scale> CLI flag at
// pipeline/tokens-parser.js (decision 31). `gray` is kept as the
// pre-N+5.8 default; `cream` is the new build default per the brand's
// warmer content tone. The six alternatives stay in the primitive
// layer per P11 parsimony via RESERVED_COLOR_SCALES in the guardrail
// test.
export const NEUTRAL_SCALES = [
  'gray', 'mauve', 'slate', 'sage', 'olive', 'sand', 'cream',
];
export const DEFAULT_NEUTRAL = 'cream';

export function validateNeutral(value) {
  if (!NEUTRAL_SCALES.includes(value)) {
    throw new Error(
      `Invalid --neutral value '${value}'. ` +
      `Allowed scales: ${NEUTRAL_SCALES.join(', ')}.`,
    );
  }
  return value;
}

// Axis registry · maps a dimension name (as it appears in [data-<dim>=…]
// selectors) to the list of values the cross-product iterates and to
// the TS type identifier emitted in the resulting Record<…> nesting.
// Adding a new dimension wires here once: register its values + type,
// declare a GROUP_NAMES entry for the signature it produces, and the
// classifier + emitter pick it up. No further branching needed.
export const AXIS_REGISTRY = {
  accent: { values: ACCENTS, typeName: 'Accent' },
  theme:  { values: THEMES,  typeName: 'Theme' },
};

// Signature → group meta. A signature is the sorted list of dimension
// names a var's declarations span (joined with ','). Unmapped signature
// is a hard error: a future contributor adding a new cascade block
// (font/density/neutral …) must consciously pick a group name before
// the build will succeed.
//
//   cssPrefix · the literal prefix stripped from each var name before
//     camelCasing into the group's leaf identifier. `--nuri-` strips
//     only the project namespace (chrome leaves keep their bg-/text-/
//     border-/focus- subprefix); `--nuri-accent-` strips the group's
//     own subprefix so leaves read `solid`, `bgSubtle`, …
//   namingPrefix · the optional CSS-name prefix that, when present on
//     a var, asserts the var must classify here (and absent asserts
//     it must NOT). The chrome group has no naming prefix because its
//     leaves use multiple roots (bg-/text-/border-/focus-); the check
//     runs one-way through whichever groups define a namingPrefix.
//
// A signature may map to either a single group OR an array of groups
// (decision 36 · N+6.1). The array form is for cascade-invariant
// signatures (empty `''`) where multiple semantic vocabularies share
// the same dimensionality and the classifier discriminates by
// `namingPrefix`. Each entry under an array MUST declare a
// `namingPrefix` (it is the disambiguator).
export const GROUP_NAMES = {
  'theme':        { name: 'chrome', cssPrefix: '--nuri-' },
  'accent,theme': { name: 'accent', cssPrefix: '--nuri-accent-', namingPrefix: '--nuri-accent-' },
  '': [
    { name: 'space',  cssPrefix: '--nuri-space-',  namingPrefix: '--nuri-space-' },
    { name: 'size',   cssPrefix: '--nuri-size-',   namingPrefix: '--nuri-size-' },
    // Radius added at N+6.1.1 (amendment 36.1) · third sibling under
    // the semantic dimension family · same structural slot.
    { name: 'radius', cssPrefix: '--nuri-radius-', namingPrefix: '--nuri-radius-' },
  ],
};

// Iterate every (signature, meta) pair in GROUP_NAMES, flattening
// array-valued entries. Used by the classifier (both the lookup and
// the naming-vs-cascade agreement check) so the array shape stays
// invisible at the call sites.
function groupNameEntries() {
  const out = [];
  for (const [sig, entry] of Object.entries(GROUP_NAMES)) {
    if (Array.isArray(entry)) {
      for (const meta of entry) out.push({ sig, meta });
    } else {
      out.push({ sig, meta: entry });
    }
  }
  return out;
}

// Pick the group meta for a (cssVar, sig) pair. For single-entry
// signatures the lookup is direct; for array-valued signatures the
// var must match exactly one entry's namingPrefix (zero matches →
// null; multiple → throws so a future overlap surfaces loudly).
function pickGroupMeta(cssVar, sig) {
  const entry = GROUP_NAMES[sig];
  if (entry == null) return null;
  if (!Array.isArray(entry)) return entry;
  const matches = entry.filter((m) => m.namingPrefix && cssVar.startsWith(m.namingPrefix));
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    throw new Error(
      `semantic var ${cssVar} matches more than one GROUP_NAMES entry under signature ` +
      `[${sig}]: ${matches.map((m) => m.name).join(', ')}. namingPrefix collision — pick ` +
      `more-specific prefixes or merge the groups.`,
    );
  }
  return matches[0];
}

// ── Set policy registry (N+6.0.3 · decision 34) ───────────────────
// Every set the pipeline touches declares a policy: whether it shows
// up in the runtime tokens.ts namespace (`runtime`) and whether
// references to it from component CSS resolve to literal values
// during pipeline emit (`pipelineInline`).
//
// Auto-rule: cascade-varying sets (any `[data-<dim>=…]` block declares
// a leaf) MUST be runtime: true / pipelineInline: false. The flag is
// derived mechanically by the classifier; explicit policy here is
// optional (empty `{}`) and must not contradict.
//
// Operator pick is meaningful only for context-invariant sets: pick
// `runtime: true` to expose the vocabulary to consumers, or
// `pipelineInline: true` to keep it internal and resolve at build.
// Exactly one must be true (an entry with neither is an orphan).
//
// Sets reference the classifier's group name (semantic.<name>) or
// the primitive-prefix mapping below (primitive.<name>).
export const SET_POLICY = {
  // Primitive layer · all internal vocab · pipeline-inlined
  'primitive.colour':   { runtime: false, pipelineInline: true },
  'primitive.px':       { runtime: false, pipelineInline: true },
  'primitive.radius':   { runtime: false, pipelineInline: true },
  'primitive.type':     { runtime: false, pipelineInline: true },
  'primitive.font':     { runtime: false, pipelineInline: true },
  'primitive.duration': { runtime: false, pipelineInline: true },
  'primitive.interaction': { runtime: false, pipelineInline: true },

  // Semantic cascade-varying · auto · runtime forced
  'semantic.chrome':    {}, // auto: cascadeVarying=true → runtime
  'semantic.accent':    {}, // auto: cascadeVarying=true → runtime

  // Semantic dimension vocabulary · cascade-invariant · runtime
  // exposed for layout consumers (decision 36 · N+6.1; amendment
  // 36.1 added radius at N+6.1.1). Space + size + radius ship as
  // T-shirt scales aliasing the primitive --nuri-px-N layer (radius
  // additionally has a literal `full: 100%` leaf without primitive
  // backing — handled identically by the runtime emit via the
  // string/number union the dimension namespace already supports).
  'semantic.space':     { runtime: true, pipelineInline: false },
  'semantic.size':      { runtime: true, pipelineInline: false },
  'semantic.radius':    { runtime: true, pipelineInline: false },
};

// Primitive-prefix → set-name lookup. The order does not matter (the
// longest matching prefix wins because the catalogue is enumerated
// linearly per startsWith). Mirrors TYPE_PREFIXES in primitive.js but
// at the set granularity (one set per family, not per token type).
const PRIMITIVE_SET_PREFIXES = [
  ['--nuri-color-',       'primitive.colour'],
  ['--nuri-px-',          'primitive.px'],
  ['--nuri-radius-',      'primitive.radius'],
  ['--nuri-font-size-',   'primitive.font'],
  ['--nuri-font-family-', 'primitive.font'],
  ['--nuri-font-weight-', 'primitive.font'],
  ['--nuri-type-',        'primitive.type'],
  ['--nuri-duration-',    'primitive.duration'],
  ['--nuri-interaction-', 'primitive.interaction'],
];

export function primitiveSetFor(cssVar) {
  for (const [prefix, setName] of PRIMITIVE_SET_PREFIXES) {
    if (cssVar.startsWith(prefix)) return setName;
  }
  return null;
}

// Central enforcer of SET_POLICY. Returns the resolved policy
// `{ cascadeVarying, runtime, pipelineInline }` after applying the
// auto-rule + orphan/missing-entry checks. `policy` defaults to the
// module-level SET_POLICY; callers pass a custom registry only in
// tests (so policy-mechanism failure modes can be exercised without
// touching the live registry).
export function resolveSetPolicy(setKey, cascadeVarying, policy = SET_POLICY) {
  const entry = policy[setKey];
  if (entry == null) {
    throw new Error(
      `set '${setKey}' has no SET_POLICY entry — add one to pipeline/parsers/semantic.js ` +
      `with { runtime, pipelineInline } (or empty {} for cascade-varying sets that ` +
      `auto-force runtime).`
    );
  }
  if (cascadeVarying) {
    if (entry.runtime === false) {
      throw new Error(
        `set '${setKey}' classified cascade-varying but SET_POLICY declares runtime: false — ` +
        `auto-rule violation. Cascade-varying sets must be runtime.`
      );
    }
    if (entry.pipelineInline === true) {
      throw new Error(
        `set '${setKey}' classified cascade-varying but SET_POLICY declares pipelineInline: true — ` +
        `auto-rule violation. Cascade-varying sets cannot be pipeline-inlined (their value depends ` +
        `on consumer context).`
      );
    }
    return { cascadeVarying: true, runtime: true, pipelineInline: false };
  }
  const runtime = entry.runtime === true;
  const pipelineInline = entry.pipelineInline === true;
  if (!runtime && !pipelineInline) {
    throw new Error(
      `set '${setKey}' has SET_POLICY entry with neither runtime nor pipelineInline — orphan. ` +
      `Set at least one to true, or remove the entry.`
    );
  }
  return { cascadeVarying: false, runtime, pipelineInline };
}

// Build a flat Map<cssVar, value> from the primitive CSS. Every primitive (raw
// literal or alias) lives in a :root block — including the
// --nuri-color-neutral-N-* aliases, which (since N+32 C1) resolve to the active
// scale through ONE :root block the build bakes from --neutral (e.g. cream:
//   --nuri-color-neutral-1-light → var(--nuri-color-cream-1-light)).
// Source-order cascade at :root: later declarations win — matches the browser
// behaviour for primitive aliases. The runtime [data-neutral] switcher RETIRED at
// C1 (build-time selection only · one :root block), so there is no per-scope
// argument any more — matching :root captures everything (N+32 C2 cleanup).
export function buildPrimitiveMap(css) {
  const root = postcss.parse(css);
  const map = new Map();
  root.walkRules((rule) => {
    if (!rule.selectors.some((s) => s.trim() === ':root')) return;
    rule.walkDecls((decl) => {
      if (!decl.prop.startsWith('--nuri-')) return;
      map.set(decl.prop, decl.value.trim());
    });
  });
  return map;
}

// Read each rule in tokens-semantic.css in source order. Returns
// [{ selector, decls: Map }] — selectors stay as raw text so the
// cascade matcher can inspect them. Only --nuri-* declarations are
// captured.
export function readSemanticRules(css) {
  const root = postcss.parse(css);
  const rules = [];
  root.walkRules((rule) => {
    const decls = new Map();
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--nuri-')) {
        decls.set(decl.prop, decl.value.trim());
      }
    });
    if (decls.size === 0) return;
    rules.push({ selector: rule.selector.trim(), decls });
  });
  return rules;
}

// Port of lib/docs/tokens.js#selectorMatches. Returns {matches, spec}.
// `:root` is treated as always matching — its values become the
// inherited base; more-specific rules below win on (spec, source
// order). spec is the attribute-count: 1 for single-attr selectors,
// 2 for the combined-attr blocks (4 + 6).
export function selectorMatches(selector, accent, theme) {
  const sel = selector.trim();
  if (sel === ':root') return { matches: true, spec: 1 };
  const attrCount = (sel.match(/\[/g) || []).length;
  if (attrCount === 0) return { matches: false, spec: 0 };
  const themeOk = sel.includes('[data-theme="dark"]') ? theme === 'dark' : true;
  const neutralOk = sel.includes('[data-accent="neutral"]') ? accent === 'neutral' : true;
  const lilacOk = sel.includes('[data-accent="lilac"]') ? accent === 'lilac' : true;
  return { matches: themeOk && neutralOk && lilacOk, spec: attrCount };
}

// Pick the cascade-winning declaration for `cssVar` at (accent, theme).
// Collects every matching rule that declares the var, sorts by
// (specificity desc, source-index desc), takes the first. Returns
// the raw RHS (typically a `var(...)`), or null if nothing matches.
export function findWinningDecl(rules, cssVar, accent, theme) {
  const matches = [];
  for (let idx = 0; idx < rules.length; idx++) {
    const rule = rules[idx];
    const m = selectorMatches(rule.selector, accent, theme);
    if (!m.matches) continue;
    const val = rule.decls.get(cssVar);
    if (val == null || val === '') continue;
    matches.push({ spec: m.spec, idx, value: val });
  }
  if (matches.length === 0) return null;
  matches.sort((a, b) => (b.spec - a.spec) || (b.idx - a.idx));
  return matches[0].value;
}

// Chase a var(...) chain through `primitives` until a literal is
// reached. Returns the literal, null if the chain dangles, or
// throws on a cycle (depth > 16 — Nuri's chains are 2–3 deep).
//
// Every semantic token's RHS is a single `var(--x)` (a colour /
// dimension alias) chased to its terminal literal. No semantic token
// carries a composite RHS (the N+8 bg-subtle-x-fade gradient was the
// lone exception; it was reverted to a flat var() alias at N+8.1).
export function resolveValue(value, primitives) {
  let cur = value;
  let depth = 0;
  while (cur != null && /^var\(/i.test(cur)) {
    const m = cur.match(/^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/);
    if (!m) break;
    const next = primitives.get(m[1]);
    if (next == null) return null;
    cur = next;
    if (++depth > 16) {
      throw new Error(`var() chain too deep starting from ${value}`);
    }
  }
  return cur;
}

export function collectSemanticVars(rules) {
  const seen = new Set();
  const out = [];
  for (const r of rules) {
    for (const k of r.decls.keys()) {
      if (!seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
  }
  return out;
}

// Resolve the full cross-product. Returns:
//   { [cssVar]: { [accent]: { [theme]: literal | null } } }
// Null literal means the cascade matched but the var() chain
// dangled; null at the cascade level means no rule declared the var
// for that context (genuine gap, not drift).
export function resolveSemanticCrossProduct(semanticRules, primitiveMap) {
  const allVars = collectSemanticVars(semanticRules);
  const out = {};
  for (const cssVar of allVars) {
    out[cssVar] = {};
    for (const accent of ACCENTS) {
      out[cssVar][accent] = {};
      for (const theme of THEMES) {
        const raw = findWinningDecl(semanticRules, cssVar, accent, theme);
        out[cssVar][accent][theme] = raw == null ? null : resolveValue(raw, primitiveMap);
      }
    }
  }
  return out;
}

// ── Classify-by-cascade ────────────────────────────────────────────
// Inspect which [data-<dim>=…] blocks declare a var; the set of dims
// is the var's dimensionality signature. :root contributes no dim
// (it's the default scope) — a var declared only under :root would
// classify to the empty signature (no dimensions vary). No such vars
// exist today; the signature is supported because adding one is the
// natural extension point if a future "build-time-only constant"
// lands in the semantic file.
export function classifySemantic(cssVar, rules) {
  const dims = new Set();
  for (const r of rules) {
    if (!r.decls.has(cssVar)) continue;
    for (const m of r.selector.matchAll(/\[data-([\w-]+)=/g)) {
      dims.add(m[1]);
    }
  }
  return [...dims].sort();
}

function signatureKey(dims) {
  return dims.join(',');
}

function camelCase(str) {
  return str.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

// Classify every declared var into its group; throws on:
//   · Unknown signature (forces a conscious GROUP_NAMES naming choice)
//   · namingPrefix vs cascade disagreement (the var name implies one
//     group; the cascade puts it in another → either the var was
//     misnamed or a new cascade block was added without renaming)
//   · Var doesn't start with its group's cssPrefix
//   · Duplicate leaf names within a group
// Returns Map<groupName, { meta, dims, entries: [{ cssVar, leafName }] }>.
export function classifyAll(rules) {
  const allVars = collectSemanticVars(rules);
  const groups = new Map();
  for (const cssVar of allVars) {
    const dims = classifySemantic(cssVar, rules);
    const sig = signatureKey(dims);
    if (!(sig in GROUP_NAMES)) {
      throw new Error(
        `semantic var ${cssVar} classifies to unknown signature [${sig}] — ` +
        `add an entry to GROUP_NAMES in pipeline/parsers/semantic.js mapping ` +
        `'${sig}' to a group name (cssPrefix + optional namingPrefix).`,
      );
    }
    const meta = pickGroupMeta(cssVar, sig);
    if (!meta) {
      throw new Error(
        `semantic var ${cssVar} classifies to signature [${sig}] but no GROUP_NAMES ` +
        `entry's namingPrefix matches — add an entry under the signature or fix the var name.`,
      );
    }
    // Naming-vs-cascade agreement · groups with a namingPrefix assert
    // both directions: any var starting with the prefix must classify
    // here (same signature AND, for array-valued signatures, this
    // specific entry), and any var classified here must start with
    // the prefix.
    for (const { sig: otherSig, meta: otherMeta } of groupNameEntries()) {
      if (!otherMeta.namingPrefix) continue;
      const named = cssVar.startsWith(otherMeta.namingPrefix);
      const classifiedHere = sig === otherSig && meta === otherMeta;
      if (named !== classifiedHere) {
        throw new Error(
          `semantic var ${cssVar} naming/cascade disagree on group '${otherMeta.name}': ` +
          `name ${named ? 'matches' : 'does not match'} namingPrefix ${otherMeta.namingPrefix} ` +
          `but cascade ${classifiedHere ? 'puts' : 'does not put'} it there ` +
          `(signature [${sig}] → '${meta.name}'). Fix the var name or the cascade.`,
        );
      }
    }
    if (!cssVar.startsWith(meta.cssPrefix)) {
      throw new Error(
        `semantic var ${cssVar} does not start with group '${meta.name}' cssPrefix ${meta.cssPrefix}`,
      );
    }
    const leafName = camelCase(cssVar.slice(meta.cssPrefix.length));
    if (!groups.has(meta.name)) {
      groups.set(meta.name, { meta, dims, entries: [] });
    }
    const group = groups.get(meta.name);
    if (group.entries.some((e) => e.leafName === leafName)) {
      throw new Error(
        `duplicate leaf '${leafName}' in group '${meta.name}' (from ${cssVar}) — ` +
        `leaf names must be unique within a group.`,
      );
    }
    group.entries.push({ cssVar, leafName });
  }
  // Attach the set-policy verdict to every classified group. The
  // cascade-varying flag is derived mechanically (any dim ≠ empty);
  // resolveSetPolicy enforces the auto-rule + orphan + missing-entry
  // checks and throws specifically so the build surfaces the
  // forced-conscious-choice points at the policy registry, not in
  // downstream emitters.
  for (const [groupName, group] of groups) {
    const setKey = `semantic.${groupName}`;
    const cascadeVarying = group.dims.length > 0;
    group.setKey = setKey;
    group.policy = resolveSetPolicy(setKey, cascadeVarying);
  }
  return groups;
}

// ── tokens.ts emitter ──────────────────────────────────────────────
// One exported binding per group; each binding is a nested object
// whose nesting depth equals the group's dim count. Shape:
//   dims=[]              → flat object        { leaf: value, … }
//   dims=['theme']       → Record<Theme, { … }>
//   dims=['accent','theme'] → Record<Accent, Record<Theme, { … }>>
//   …generalises to any axis registered in AXIS_REGISTRY.
// Type literal is derived from the same data — no hand-sync between
// runtime shape and TS type.

// Walk the group's dims, producing a nested object of leaf values.
// Validates dangling at every leaf and accent-invariance for groups
// whose dims don't include 'accent' (chrome, and the cascade-invariant
// semantic dimension groups — space, size · decision 36) — by the
// cascade classifier the values *should* be identical across accents,
// so the equality assertion is a sanity rail rather than a substantive
// check. Theme-invariance for the empty-signature groups is checked
// in the same loop (light + dark must agree too — otherwise something
// declared the var under a [data-theme=…] block and the classifier
// would have promoted the signature).
function buildGroupValues(group, resolved) {
  const axes = group.dims;
  function walk(axisIdx, scope) {
    if (axisIdx === axes.length) {
      const leaves = {};
      for (const { cssVar, leafName } of group.entries) {
        const r = resolved[cssVar];
        if (!r) throw new Error(`semantic var ${cssVar} not in resolved cross-product`);
        const accent = scope.accent ?? ACCENTS[0];
        const theme = scope.theme ?? THEMES[0];
        const v = r[accent][theme];
        if (v == null) {
          throw new Error(`semantic var ${cssVar} dangled at ${JSON.stringify(scope)}`);
        }
        leaves[leafName] = v;
      }
      return leaves;
    }
    const axis = axes[axisIdx];
    const reg = AXIS_REGISTRY[axis];
    if (!reg) {
      throw new Error(
        `no AXIS_REGISTRY entry for dimension '${axis}' (group '${group.meta.name}') — ` +
        `register its values + typeName so the emitter knows how to iterate it.`,
      );
    }
    const out = {};
    for (const value of reg.values) {
      out[value] = walk(axisIdx + 1, { ...scope, [axis]: value });
    }
    return out;
  }

  if (!axes.includes('accent')) {
    for (const { cssVar } of group.entries) {
      const r = resolved[cssVar];
      for (const theme of THEMES) {
        const values = ACCENTS.map((a) => r[a][theme]);
        const [first] = values;
        if (values.some((v) => v == null)) {
          throw new Error(`group '${group.meta.name}' var ${cssVar} dangled at theme=${theme}`);
        }
        if (!values.every((v) => v === first)) {
          throw new Error(
            `group '${group.meta.name}' var ${cssVar} expected accent-invariant at theme=${theme} ` +
            `but values differ: ` +
            ACCENTS.map((a, i) => `${a}=${values[i]}`).join(', ') + `. A new accent block ` +
            `must have declared this var — but then the classifier should have routed it to ` +
            `the 'accent' group. Inspect the cascade.`,
          );
        }
      }
    }
  }
  // Empty-signature groups (space, size · decision 36 · N+6.1) must
  // also be theme-invariant: the classifier put them at signature ''
  // because no [data-theme=…] block declares them, but if some future
  // edit added a `[data-theme="dark"]` override and the classifier
  // hadn't picked it up yet, this check surfaces the slip.
  if (axes.length === 0) {
    for (const { cssVar } of group.entries) {
      const r = resolved[cssVar];
      const first = r[ACCENTS[0]][THEMES[0]];
      for (const accent of ACCENTS) {
        for (const theme of THEMES) {
          if (r[accent][theme] !== first) {
            throw new Error(
              `group '${group.meta.name}' var ${cssVar} expected (accent × theme)-invariant ` +
              `but values differ: (${accent}, ${theme})=${r[accent][theme]} vs ` +
              `(${ACCENTS[0]}, ${THEMES[0]})=${first}. Cascade slipped — inspect the source.`,
            );
          }
        }
      }
    }
  }

  return walk(0, {});
}

// Map a leaf's cssVar to its emitted TS type by prefix. Used as the
// fallback path for axis-bearing groups (chrome / accent today)
// whose nested-value shape doesn't expose a single representative
// literal per leaf.
//
// Chrome semantic borders share the --nuri-border- prefix with the
// primitive border-width family (which IS a dimension); carve them
// back to 'string' explicitly so they emit as colour literals.
// Mirrors the equivalent specific-before-general ordering in
// lib/docs/tokens.js TYPE_PREFIXES.
function semanticLeafTsTypeByPrefix(cssVar) {
  if (/^--nuri-border-(subtle|default|strong)$/.test(cssVar)) return 'string';
  const t = inferType(cssVar);
  if (t === 'dimension' || t === 'duration') return 'number';
  return 'string';
}

// Test whether a raw CSS literal can reduce to a JS numeric. Mirrors
// the conversion table in rawToNumberExpr — must stay in sync.
function isNumericLiteral(raw) {
  if (typeof raw !== 'string') return false;
  if (raw.endsWith('px')) return !Number.isNaN(Number(raw.slice(0, -2)));
  if (raw.endsWith('ms')) return !Number.isNaN(Number(raw.slice(0, -2)));
  if (raw.endsWith('s'))  return !Number.isNaN(Number(raw.slice(0, -1)));
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return true;
  return false;
}

// Convert a raw CSS literal (e.g. '12px', '220ms', '0.97') to a JS
// numeric expression string. Throws if the value isn't reducible to a
// number — surfaces a future composite/calc value loudly rather than
// silently emitting an invalid literal.
function rawToNumberExpr(raw) {
  if (raw.endsWith('px')) return String(Number(raw.slice(0, -2)));
  if (raw.endsWith('ms')) return String(Number(raw.slice(0, -2)));
  if (raw.endsWith('s'))  return String(Number(raw.slice(0, -1)) * 1000);
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return raw;
  throw new Error(`cannot convert literal '${raw}' to a JS numeric expression`);
}

// Pick the per-leaf TS type. For axis-bearing groups (chrome /
// accent · values is a nested Record<axis, …>), defer to the
// prefix-based lookup — all leaves are colour strings. For cascade-
// invariant groups (space / size / radius · values is a flat map of
// rawLiteral strings), inspect the actual literal: numeric-reducible
// literals (e.g. '12px', '9999px') emit as `number`; non-numeric
// literals (e.g. 'auto', 'forever') would emit as `string`. Today
// all cascade-invariant namespaces are uniformly `number` (radius
// shipped 'full = 100%' at amendment 36.1 close · the N+6.1.1
// post-close polish swapped to '9999px' sentinel after 100% ellipsed
// rectangular `.nuri-tag` boxes), but the per-leaf inference stays
// in place so a future vocabulary with genuine mixed-literal leaves
// plugs in without per-namespace branching.
function semanticLeafTsType(group, leafName, cssVar, values) {
  if (group.dims.length === 0) {
    const raw = values[leafName];
    return isNumericLiteral(raw) ? 'number' : 'string';
  }
  return semanticLeafTsTypeByPrefix(cssVar);
}

// Quote a key if it isn't a valid bare JS identifier (covers T-shirt
// scale leaves like '2xs' / '2xl' / '3xl' that start with a digit
// and would parse as a number literal otherwise).
function fmtKey(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : `'${name}'`;
}

function fmtTypeLiteral(axes, leafNames, indent, leafTypes) {
  if (axes.length === 0) {
    const lines = ['{'];
    for (const name of leafNames) {
      const tsType = leafTypes?.get(name) ?? 'string';
      lines.push(`${indent}  ${fmtKey(name)}: ${tsType};`);
    }
    lines.push(`${indent}}`);
    return lines.join('\n');
  }
  const [axis, ...rest] = axes;
  const reg = AXIS_REGISTRY[axis];
  if (!reg) throw new Error(`no AXIS_REGISTRY entry for dimension '${axis}'`);
  return `Record<${reg.typeName}, ${fmtTypeLiteral(rest, leafNames, indent, leafTypes)}>`;
}

function fmtValueObject(values, indent, keyWidth, leafTypes) {
  // values can be a nested object (axis level) or a flat object of strings (leaf level).
  const entries = Object.entries(values);
  if (entries.length === 0) return '{}';
  // Detect leaf level by checking whether any value is a primitive string.
  const isLeaf = entries.every(([, v]) => typeof v === 'string');
  if (isLeaf) {
    const width = keyWidth ?? Math.max(...entries.map(([k]) => fmtKey(k).length)) + 1;
    const lines = ['{'];
    for (const [k, v] of entries) {
      const label = `${fmtKey(k)}:`.padEnd(width + 1);
      const tsType = leafTypes?.get(k) ?? 'string';
      const expr = tsType === 'number' ? rawToNumberExpr(v) : `'${v}'`;
      lines.push(`${indent}  ${label} ${expr},`);
    }
    lines.push(`${indent}}`);
    return lines.join('\n');
  }
  // Axis level: recurse. Pick a shared keyWidth at the deepest leaf level
  // so columns line up — only compute once at the outermost call.
  const leafWidth = keyWidth ?? computeLeafKeyWidth(values);
  const lines = ['{'];
  for (const [k, v] of entries) {
    const sub = fmtValueObject(v, indent + '  ', leafWidth, leafTypes);
    lines.push(`${indent}  ${fmtKey(k)}: ${sub},`);
  }
  lines.push(`${indent}}`);
  return lines.join('\n');
}

function computeLeafKeyWidth(values) {
  // Descend to the first leaf level and measure key widths there.
  let node = values;
  while (node && typeof node === 'object') {
    const sample = Object.values(node)[0];
    if (sample == null || typeof sample !== 'object') break;
    // If next level is a flat string map, this level is the leaf parent.
    const nextEntries = Object.entries(sample);
    if (nextEntries.length === 0 || nextEntries.every(([, v]) => typeof v === 'string')) {
      node = sample;
      break;
    }
    node = sample;
  }
  const keys = Object.keys(node ?? {});
  if (keys.length === 0) return 0;
  return Math.max(...keys.map((k) => k.length)) + 1;
}

function fmtGroup(group, resolved) {
  const values = buildGroupValues(group, resolved);
  const leafNames = group.entries.map((e) => e.leafName);
  const leafTypes = new Map(
    group.entries.map((e) => [e.leafName, semanticLeafTsType(group, e.leafName, e.cssVar, values)]),
  );
  const typeLit = fmtTypeLiteral(group.dims, leafNames, '', leafTypes);
  const valueLit = fmtValueObject(values, '', null, leafTypes);
  return `export const ${group.meta.name}: ${typeLit} = ${valueLit};`;
}

export function emitTokensTs(resolved, rules) {
  if (!rules) {
    throw new Error(
      `emitTokensTs requires the semantic rules array (post-N+5.5 ` +
      `classify-by-cascade emitter) — pass readSemanticRules(css) as the ` +
      `second argument.`,
    );
  }
  const groups = classifyAll(rules);

  // Sort groups by emit order: chrome first, then accent, then the
  // semantic dimension vocabulary (space, size, radius · decision 36
  // + amendment 36.1), then anything new alphabetically. Stable
  // ordering keeps the diff small when adding a new group; the
  // explicit prefix matches the consumer mental model — colour
  // comes first, dimensions second.
  const EMIT_ORDER = ['chrome', 'accent', 'space', 'size', 'radius'];
  const sortedNames = [...groups.keys()].sort((a, b) => {
    const ai = EMIT_ORDER.indexOf(a);
    const bi = EMIT_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  const headerSummary = sortedNames
    .map((n) => {
      const g = groups.get(n);
      const dims = g.dims.length === 0 ? 'singleton' : g.dims.join(' × ');
      return ` *  · ${n} (${dims}): ${g.entries.map((e) => e.leafName).join(', ')}`;
    })
    .join('\n');

  const header = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · TOKENS · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · styles/tokens-primitive.css + styles/tokens-semantic.css`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * Contains ONLY runtime sets (decision 34 · N+6.0.3): every set`,
    ` * whose value depends on consumer context (theme · accent · …)`,
    ` * lives here. Context-invariant primitive vocabulary is`,
    ` * pipeline-inlined into per-component files at`,
    ` * build/components/<name>.ts; the discriminated union of every`,
    ` * runtime-set leaf path lives at build/token-paths.ts.`,
    ` *`,
    ` * Shape is classify-by-cascade (decision 28 · N+5.5): each`,
    ` * export's nesting depth = the dimensions its source CSS var`,
    ` * spans across [data-<dim>=…] selectors. Groups in this build:`,
    headerSummary,
    ` *`,
    ` * The semantic-cascade walker resolves each token to a literal`,
    ` * per (accent × theme) by walking the cascade blocks of`,
    ` * tokens-semantic.css and chasing the var() chain through the`,
    ` * primitives at the build's selected --neutral scope (decision 31`,
    ` * · default cream; pass --neutral=<scale> to pipeline/tokens-parser.js`,
    ` * to switch).`,
    ` * ────────────────────────────────────────────────────────────── */`,
  ].join('\n');

  const parts = [header, ''];

  // Type exports for every axis surfaced by the discovered groups.
  // Emitted once even if used by multiple groups; only those that
  // actually appear in some group's dims are emitted (no dead types).
  const usedAxes = new Set();
  for (const g of groups.values()) {
    for (const d of g.dims) usedAxes.add(d);
  }
  for (const axis of [...usedAxes].sort()) {
    const reg = AXIS_REGISTRY[axis];
    parts.push(`export type ${reg.typeName} = ${reg.values.map((v) => `'${v}'`).join(' | ')};`);
  }
  if (usedAxes.size > 0) parts.push('');

  for (const name of sortedNames) {
    const group = groups.get(name);
    if (!group.policy.runtime) continue;
    const dimsLabel = group.dims.length === 0 ? 'singleton' : group.dims.join(' × ');
    parts.push(`// ── ${name} · ${dimsLabel} ──`);
    parts.push(fmtGroup(group, resolved));
    parts.push('');
  }

  return parts.join('\n');
}

// ── token-vars · the semantic COLOUR var registry (N+42 · the @nuri/doc data export) ──
// Emit build/token-vars.ts: each cascade-VARYING semantic group's leaf → its CSS
// custom-property NAME — the leaf→cssVar map classifyAll derives from the token CSS
// (NOT hand-kebabed: chrome.bgStrong → --nuri-bg-strong DROPS the group prefix,
// accent.solid → --nuri-accent-solid KEEPS it · the cssPrefix lives in GROUP_NAMES).
// @nuri/doc reads this to render the Token-map / Base colour swatch's LIVE `var()`
// chip (so it re-themes with scope · N+23). The doc consumes spec DATA, never the
// classifier — the post-flip boundary (decision 75 · convergence §5). One source,
// two readers (decision 48): the SAME classifiedGroups the tokens.ts cascade emit walks.
//
// COLOUR groups only (chrome · accent — cascade-varying). The cascade-INVARIANT
// dimension groups (space/size/radius) are EXCLUDED: the docs render them as literal
// px (no live swatch · no scope re-theming), so they need no var. The exclusion is
// principled, not a doc carve-out — a swatch exists precisely BECAUSE the value varies
// by scope; a px does not. Byte-stable (decision 35): canonical group/leaf order, no
// timestamps. Emitted as `as const` so the @nuri/doc loader's TS-strip imports it raw
// (node 20 cannot import a .ts · the descriptor-twin technique · decision 69).
export function emitTokenVarsTs(classifiedGroups) {
  const header = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · TOKEN VARS · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · styles/tokens-semantic.css (the leaf→cssVar map · classifyAll)`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * The CSS custom-property NAME for every cascade-varying semantic colour`,
    ` * leaf (chrome · accent). @nuri/doc reads this to render the Token-map`,
    ` * swatch's LIVE \`var()\` chip — the spec emits the data, @nuri/doc transforms`,
    ` * it → Markdown (convergence §5). The dimension scales (space/size/radius)`,
    ` * are excluded: the docs render them as literal px, not live swatches.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
  ].join('\n');

  // Cascade-VARYING groups only (dims non-empty → chrome · accent), in the
  // tokens.ts emit order (colour first); a future varying group falls in
  // alphabetically. The dimension singletons (dims === []) are skipped.
  const EMIT_ORDER = ['chrome', 'accent'];
  const names = [...classifiedGroups.keys()]
    .filter((n) => classifiedGroups.get(n).dims.length > 0)
    .sort((a, b) => {
      const ai = EMIT_ORDER.indexOf(a), bi = EMIT_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

  const isIdent = (k) => /^[A-Za-z_$][\w$]*$/.test(k);
  const body = names
    .map((n) => {
      const leaves = classifiedGroups
        .get(n)
        .entries.map(({ leafName, cssVar }) => `    ${isIdent(leafName) ? leafName : `'${leafName}'`}: '${cssVar}',`)
        .join('\n');
      return `  ${n}: {\n${leaves}\n  },`;
    })
    .join('\n');

  return header + `export const tokenVars = {\n${body}\n} as const;\n`;
}
