/* ──────────────────────────────────────────────────────────────
 * NURI · INTERACTIVE NAMESPACE CSS FRESHNESS + VALUE HARNESS (the LIVE generated CSS · decision 74)
 *
 * The interactive namespace CSS (styles/interactive.css) is GENERATED in place from the
 * interactive AXIS SoT (pipeline/interactive-effects.ts · agnostic `opts`) plus the
 * prototype-owned web projection in pipeline/parsers/interactive-css.js · run by `npm run
 * build` — decision 2 reversed for the namespace layer (the L3c flip · N+38). The hand
 * parity oracle RETIRED; this harness keeps the GENERATED output honest (freshness ·
 * value · order-soundness) AND pins the web factory's gate convention to the same SoT
 * (Guard E · so the opt→attr mapping lives in ONE place · N+44).
 *
 * The guard pattern transfers from palette-css.test.js, but interactive breaks
 * palette's "structural ≡ IS the complete proof" assumption (the brief §5): `transform`
 * is set by BOTH pressScale (`[data-press-scale]:active`) AND disabledGuard
 * (`[aria-disabled="true"]:active`) at EQUAL specificity (0,3,0). A node matching both
 * (a disabled, press-scale control in :active) resolves `transform` by SOURCE ORDER —
 * the hand emits pressScale BEFORE disabledGuard so `transform: none` wins (a disabled
 * control must NOT scale). This is the L3.1 Guard-D order-sensitivity gap, here LIVE.
 * So the harness does MORE than the order-insensitive structural ≡:
 *   A · STRUCTURAL ≡ — generated and hand carry the SAME @layer rules (same selector
 *       set · same declaration set per selector · comments excepted · order-insensitive)
 *       AND every selector is the `.nuri-interactive` CLASS dispatch (merged-node · no
 *       <nuri-interactive> element, no shell). NECESSARY here, NOT sufficient (transform
 *       is set twice at equal specificity → Guard D below covers order).
 *   B · RE-EMIT ≡ COMMITTED (byte) — the committed file is the emitter's current output.
 *   C · RESOLVED-VALUE — SIMPLER than palette: the --nuri-interaction-* / --nuri-
 *       duration-fast refs are :root constants (no accent×theme cascade), so the L3.1
 *       buildVarMap (keep-the-last-decl) is FINE (no colour-cascade walk needed — that
 *       was palette-specific). Two tests: (1) every embedded var ref bottoms out at a
 *       non-var final value (the refs live INSIDE compound values — `transition`,
 *       `outline`, `scale()` — so they are EXTRACTED, not whole-value matched, the one
 *       structural delta from palette's pure-var paints); (2) the scope-INVARIANT
 *       constants resolve to a RESTATED design oracle. focus-ring is scope-dependent
 *       (light/dark) → only its bottoms-out-at-a-hex is asserted here (the exact value
 *       is the browser check's job · the palette posture).
 *   D · ORDER-SOUNDNESS — the centerpiece (the brief §5). Palette's Guard D (rest
 *       mutual-exclusivity + pressed strictly-more-specific) does NOT transfer: the
 *       transform pair is EQUAL specificity, so order is genuinely load-bearing. Two
 *       legs, both structural: (a) for EVERY property set by >1 selector, the generated
 *       source-order of those selectors == the hand oracle's order (so the table-order
 *       reproduces the hand's load-bearing precedence); (b) the transform pair
 *       specifically — exactly two rules, scale() FIRST + none SECOND (none wins by
 *       source order → a disabled control never scales), both selectors equal-specificity
 *       (so order, not specificity, decides → the order IS load-bearing) and both
 *       co-match a `[data-press-scale][aria-disabled="true"]:active` node (the conflict
 *       is real). The real engine confirms it: pipeline/interactive-css-computed-check.html.
 *   E · GATE CONVENTION (N+44 · the web factory ↔ the SoT) — the web factory
 *       (factory/factory.js · browser-runtime · cannot import the .ts SoT) derives each
 *       gated opt's host attr from the opt KEY via camelToKebab, hardcoding NO attr
 *       string. This pins that derivation: the factory's INTERACTIVE_GATES === the SoT's
 *       gated opts (gate !== 'auto'), kebab(key) === opts[key].gate for each, and the
 *       rest are 'auto'. So the opt→attr mapping is single-sourced in `opts`; a new gated
 *       opt (or a renamed gate) fails HERE until the factory list catches up.
 *
 * Run:  node --test pipeline/interactive-css.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { generateInteractive } from './css-preview.js';
import { loadInteractive } from './parsers/interactive-css.js';
import { INTERACTIVE_GATES } from '../factory/factory.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The interactive axis SoT — resolved across the package boundary via @nuri/spec's
// exports map (import.meta.resolve · the css-preview.js pattern), read by Guard E.
const EFFECTS_TS = fileURLToPath(import.meta.resolve('@nuri/spec/interactive-effects'));
const PKG_ROOT = resolve(__dirname, '..'); // packages/prototype
// The committed LIVE namespace CSS — GENERATED by `npm run build -w @nuri/prototype` into
// prototype's styles/ (N+41 · the A3 carve · re-emit ≡ committed).
const LIVE_CSS = resolve(PKG_ROOT, 'styles/interactive.css');
// The token CSS is this prototype projection's OWN generated output now (N+62 · decision 80).
const TOKEN_STYLES = resolve(PKG_ROOT, 'generated/styles');
const PRIMITIVE_CSS = resolve(TOKEN_STYLES, 'tokens-primitive.css');
const SEMANTIC_CSS = resolve(TOKEN_STYLES, 'tokens-semantic.css');

// ── parse a stylesheet's `@layer <layer>` → Map<selector, Map<prop,value>> ──
// COPIED from palette-css.test.js / css-preview.test.js (the brief's "copy not
// extract" sub-decision · the shared file stays untouched · extraction is an L3c
// cleanup). postcss skips comment nodes, so comments are excepted naturally.
// Multi-selector rules are split (interactive's disabledOpacity has one). A duplicate
// (selector, prop) within one file is a parse-level surprise → throw.
function layerRuleMap(css, layer = 'rules') {
  const root = postcss.parse(css);
  const map = new Map();
  root.walkAtRules('layer', (at) => {
    if (at.params !== layer) return;
    at.walkRules((rule) => {
      for (const selRaw of rule.selector.split(',')) {
        const sel = selRaw.trim();
        if (!map.has(sel)) map.set(sel, new Map());
        const decls = map.get(sel);
        rule.walkDecls((d) => {
          if (decls.has(d.prop)) throw new Error(`duplicate decl '${d.prop}' for '${sel}'`);
          decls.set(d.prop, d.value.trim());
        });
      }
    });
  });
  return map;
}

// collapse insignificant inter-token whitespace (CSS treats any whitespace RUN
// between tokens as equivalent) — the hand `transition` value wraps across two
// indented lines, the generated one is single-line; both are the same value. Sound
// for this axis (no string-literal values · interactive has none).
const normWs = (s) => s.replace(/\s+/g, ' ').trim();

// a stable, comparable string for a selector's declarations (order-insensitive ·
// whitespace-normalized).
const declSig = (declMap) =>
  [...declMap.entries()].map(([p, v]) => `${p}: ${normWs(v)}`).sort().join('; ');

// ── source-ordered (selector, prop, value) triples from `@layer rules` ──
// Unlike layerRuleMap (keyed · order-insensitive use), this preserves SOURCE ORDER —
// the input to Guard D's order comparison. postcss walks rules + decls in source
// order; multi-selector rules expand in selector-list order.
function orderedDecls(css) {
  const out = [];
  postcss.parse(css).walkAtRules('layer', (at) => {
    if (at.params !== 'rules') return;
    at.walkRules((rule) => {
      const sels = rule.selector.split(',').map((s) => s.trim());
      rule.walkDecls((d) => {
        for (const sel of sels) out.push({ sel, prop: d.prop, value: d.value.trim() });
      });
    });
  });
  return out;
}

// prop → the source-ordered list of selectors that set it.
function propSelectorOrder(ordered) {
  const map = new Map();
  for (const { sel, prop } of ordered) {
    if (!map.has(prop)) map.set(prop, []);
    map.get(prop).push(sel);
  }
  return map;
}

// the specificity `b` component (classes + attributes + pseudo-classes) — enough to
// PROVE the transform pair is equal-specificity (no IDs, no elements/pseudo-elements
// in either selector · single-colon pseudo-classes only).
const specificityB = (sel) =>
  (sel.match(/\./g)?.length ?? 0) + (sel.match(/\[/g)?.length ?? 0) + (sel.match(/:/g)?.length ?? 0);

// in-memory generation, once (one source, two readers · decision 48).
const { css: generated } = await generateInteractive();

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (generated vs the hand oracle · the merged-node model)
// ══════════════════════════════════════════════════════════════════
test('Guard A · re-emit ≡ committed interactive.css (structural · merged-node)', () => {
  const hand = layerRuleMap(readFileSync(LIVE_CSS, 'utf8'));
  const gen = layerRuleMap(generated);

  const handSels = [...hand.keys()].sort();
  const genSels = [...gen.keys()].sort();
  assert.deepEqual(
    genSels, handSels,
    `selector set differs.\n  only in hand: ${handSels.filter((s) => !gen.has(s)).join(' · ') || '∅'}` +
    `\n  only in generated: ${genSels.filter((s) => !hand.has(s)).join(' · ') || '∅'}`,
  );

  for (const sel of handSels) {
    assert.equal(
      declSig(gen.get(sel)), declSig(hand.get(sel)),
      `declarations differ for '${sel}'\n  hand:      ${declSig(hand.get(sel))}\n  generated: ${declSig(gen.get(sel))}`,
    );
  }

  // MERGED-NODE: every selector is the `.nuri-interactive` CLASS dispatch — no
  // <nuri-interactive> custom element, no :not(:defined) skeleton, no shell base
  // (unlike box/stack · 65.3 §6 / B1.5 §4.2). NOT every selector has a `[` (affordance
  // is the bare class · focus is a pseudo-class), so the check is the class PREFIX.
  for (const sel of genSels) {
    assert.ok(
      sel.startsWith('.nuri-interactive'),
      `'${sel}' is not a .nuri-interactive class dispatch — interactive is merged-node (no element/shell rules)`,
    );
  }

  // The empty `@layer tokens` is empty in both (mirrored · decision 37) — zero rules either side.
  assert.equal(layerRuleMap(generated, 'tokens').size, 0, 'generated @layer tokens should be empty');
  assert.equal(layerRuleMap(readFileSync(LIVE_CSS, 'utf8'), 'tokens').size, 0, 'hand @layer tokens should be empty');
});

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed CSS == the emitter's output)
// ══════════════════════════════════════════════════════════════════
test('Guard B · committed styles/interactive.css is fresh (re-emit ≡ committed)', () => {
  assert.equal(
    readFileSync(LIVE_CSS, 'utf8'), generated,
    'styles/interactive.css is stale — re-run `npm run build` (the namespace-CSS slice regenerates it)',
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard C · RESOLVED-VALUE (the :root interaction constants · buildVarMap keep-last)
// ══════════════════════════════════════════════════════════════════
// Build a var resolution map from the REAL token CSS (the css-preview.test.js helper).
// Keep-last is FINE here: the refs are :root constants, not accent×theme cascaded (the
// palette-specific hazard) — the one exception, focus-ring, is light/dark and handled
// below (bottoms-out only · the browser check pins the scoped value).
function buildVarMap() {
  const map = new Map();
  for (const css of [PRIMITIVE_CSS, SEMANTIC_CSS]) {
    postcss.parse(readFileSync(css, 'utf8')).walkDecls((d) => {
      if (d.prop.startsWith('--nuri-')) map.set(d.prop, d.value.trim());
    });
  }
  return map;
}
function resolveVarValue(value, varMap, depth = 0) {
  if (depth > 8) throw new Error(`var resolution too deep for '${value}'`);
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (!m) return value; // a literal (120ms · 0.97 · #6c58a3 · none)
  const next = varMap.get(m[1]);
  if (next === undefined) throw new Error(`unresolved var ${m[1]}`);
  return resolveVarValue(next.trim(), varMap, depth + 1);
}
// extract every `var(--nuri-…)` ref EMBEDDED in a (possibly compound) value — the
// structural delta from palette (whose paints were pure `var(--x)` whole-values).
const refsIn = (value) => [...value.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]);

test('Guard C · every embedded interaction var bottoms out at a non-var final value', () => {
  const varMap = buildVarMap();
  let checked = 0;
  for (const [sel, decls] of layerRuleMap(generated)) {
    for (const [prop, value] of decls) {
      for (const name of refsIn(value)) {
        const final = resolveVarValue(`var(${name})`, varMap);
        assert.ok(
          final.length > 0 && !/var\(/.test(final),
          `${sel} { ${prop}: ${value} } ref ${name} does not bottom out (got ${final})`,
        );
        checked++;
      }
    }
  }
  // duration-fast ×2 (the transition) + focus-ring + press-scale + disabled-opacity.
  assert.ok(checked >= 5, `expected ≥5 embedded var refs checked, saw ${checked}`);
});

// The design oracle (RESTATED · the design-constant values · not read from the CSS
// under test) — pins the generated decl → token ref → final value chain for the
// scope-INVARIANT constants. [selector, prop, the ref the value must contain, final].
const ORACLE = [
  ['.nuri-interactive', 'transition', '--nuri-duration-fast', '120ms'],
  ['.nuri-interactive[data-press-scale]:active', 'transform', '--nuri-interaction-press-scale', '0.97'],
  ['.nuri-interactive:disabled', 'opacity', '--nuri-interaction-disabled-opacity', '0.4'],
];

test('Guard C · the scope-invariant interaction constants resolve to the restated oracle', () => {
  const varMap = buildVarMap();
  const gen = layerRuleMap(generated);
  for (const [sel, prop, ref, expected] of ORACLE) {
    const value = gen.get(sel)?.get(prop);
    assert.ok(value !== undefined, `no generated '${prop}' for '${sel}'`);
    assert.ok(value.includes(`var(${ref})`), `${sel} { ${prop} } does not reference var(${ref}) (got ${value})`);
    assert.equal(resolveVarValue(`var(${ref})`, varMap), expected, `${ref} resolves to its design value`);
  }
  // focus-ring is scope-dependent (light/dark · tokens-semantic.css) — keep-last grabs
  // the dark decl; assert only that it bottoms out at a hex (the exact light/dark value
  // is the browser check's job · the palette scope-dependent posture).
  const focus = resolveVarValue('var(--nuri-focus-ring)', varMap);
  assert.match(focus, /^#[0-9a-f]{6}$/i, `focus-ring bottoms out at a hex (got ${focus})`);
});

// ══════════════════════════════════════════════════════════════════
// Guard D · ORDER-SOUNDNESS (the equal-specificity transform pair · the centerpiece)
// ══════════════════════════════════════════════════════════════════
test('Guard D · order-soundness (per-property order ≡ committed + the transform pair scale-before-none)', () => {
  const genOrder = propSelectorOrder(orderedDecls(generated));
  const handOrder = propSelectorOrder(orderedDecls(readFileSync(LIVE_CSS, 'utf8')));

  // (a) For EVERY property set by >1 selector, the generated SOURCE ORDER of those
  // selectors == the hand oracle's. So the array-order emit reproduces the hand's
  // load-bearing precedence exactly (`transform`: pressScale before disabledGuard;
  // `opacity`: the comma list in order). Single-setter props are order-irrelevant.
  let multiSetProps = 0;
  for (const [prop, genSels] of genOrder) {
    if (genSels.length < 2) continue;
    multiSetProps++;
    assert.deepEqual(
      genSels, handOrder.get(prop),
      `the source order of selectors setting '${prop}' differs from the hand oracle\n` +
      `  hand:      ${handOrder.get(prop)?.join('  →  ')}\n  generated: ${genSels.join('  →  ')}`,
    );
  }
  assert.ok(multiSetProps >= 1, 'expected ≥1 property set by >1 selector (transform) — the order argument assumes it');

  // (b) The transform selectors specifically — the load-bearing equal-specificity conflict.
  const transforms = orderedDecls(generated).filter((d) => d.prop === 'transform');
  assert.equal(transforms.length, 4, 'expected four transform-setting selectors (:active + data-pressed for pressScale and disabledGuard)');
  const scaleRules = transforms.filter((t) => /^scale\(/.test(t.value));
  const noneRules = transforms.filter((t) => t.value === 'none');
  assert.equal(scaleRules.length, 2, 'expected two pressScale transform selectors');
  assert.equal(noneRules.length, 2, 'expected two disabledGuard transform selectors');
  assert.deepEqual(transforms.map((t) => t.value), [
    scaleRules[0].value,
    scaleRules[1].value,
    'none',
    'none',
  ], 'all pressScale selectors must emit before disabledGuard selectors');
  assert.ok(scaleRules.some((t) => t.sel.endsWith(':active')), 'pressScale must include a :active selector');
  assert.ok(scaleRules.some((t) => t.sel.includes('[data-pressed]')), 'pressScale must include a data-pressed selector');
  assert.ok(noneRules.some((t) => t.sel.endsWith(':active')), 'disabledGuard must include a :active selector');
  assert.ok(noneRules.some((t) => t.sel.includes('[data-pressed]')), 'disabledGuard must include a data-pressed selector');
  for (const scaleRule of scaleRules) {
    assert.match(scaleRule.sel, /\[data-press-scale\]/, 'the scale rule must gate on [data-press-scale]');
    const matchingNone = noneRules.find((rule) =>
      scaleRule.sel.endsWith(':active') ? rule.sel.endsWith(':active') : rule.sel.includes('[data-pressed]'));
    assert.ok(matchingNone, `no matching disabledGuard selector for ${scaleRule.sel}`);
    assert.equal(
      specificityB(scaleRule.sel), specificityB(matchingNone.sel),
      `matching transform selectors must be equal-specificity (else order would not be load-bearing)\n  ${scaleRule.sel} (b=${specificityB(scaleRule.sel)}) vs ${matchingNone.sel} (b=${specificityB(matchingNone.sel)})`,
    );
  }
  for (const noneRule of noneRules) {
    assert.match(noneRule.sel, /\[aria-disabled="true"\]/, 'the none rule must gate on [aria-disabled="true"]');
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard E · GATE CONVENTION (the web factory ↔ the SoT · single-sourced opt→attr · N+44)
// ══════════════════════════════════════════════════════════════════
// The web factory (factory/factory.js · browser-runtime · cannot import the .ts SoT)
// sets a gated opt's host attr by deriving it from the opt KEY (camelToKebab), NOT by
// hardcoding the attr string. This guard pins that derivation to the SoT so the opt→attr
// mapping lives in ONE place: the factory's INTERACTIVE_GATES must equal the SoT's gated
// opts (gate !== 'auto'), kebab(key) === opts[key].gate for each, and every other opt is
// 'auto'. A new gated opt, a renamed gate, or a stale factory list fails HERE.
test('Guard E · the web factory gate convention is single-sourced from the SoT', async () => {
  const { opts } = await loadInteractive(EFFECTS_TS);
  const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

  const gatedInSoT = Object.keys(opts).filter((k) => opts[k].gate !== 'auto');
  assert.deepEqual(
    [...INTERACTIVE_GATES].sort(),
    [...gatedInSoT].sort(),
    `the factory's INTERACTIVE_GATES must equal the SoT's gated opts (gate !== 'auto')\n` +
    `  factory: ${[...INTERACTIVE_GATES].sort().join(', ') || '∅'}\n  SoT:     ${[...gatedInSoT].sort().join(', ') || '∅'}`,
  );
  for (const key of INTERACTIVE_GATES) {
    assert.equal(
      opts[key].gate, camelToKebab(key),
      `the factory derives the host attr as kebab('${key}')='${camelToKebab(key)}', but opts.${key}.gate='${opts[key].gate}'`,
    );
  }
  // every NON-gated opt is automatic (gate 'auto' · realized with no author opt-in attr).
  for (const key of Object.keys(opts)) {
    if (INTERACTIVE_GATES.includes(key)) continue;
    assert.equal(opts[key].gate, 'auto', `opt '${key}' is not a factory gate, so its SoT gate must be 'auto' (got '${opts[key].gate}')`);
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard F · SPEC AGNOSTICISM (SEED-1a regression guard)
// ══════════════════════════════════════════════════════════════════
test('Guard F · interactive-effects.ts does not carry web CSS realization', () => {
  const src = readFileSync(EFFECTS_TS, 'utf8');
  const forbidden = [
    ['webChrome export', /\bwebChrome\b/],
    ['webOrder export', /\bwebOrder\b/],
    ['CSS variable reference', /var\(--/],
    ['active selector state', /:active/],
    ['focus-visible selector state', /:focus-visible/],
    ['data selector fragment', /\[data-/],
    ['aria selector fragment', /\[aria-/],
    ['cursor declaration', /\bcursor\b/],
    ['transition declaration', /\btransition\b/],
    ['outline declaration', /\boutline\b/],
  ];
  for (const [label, pattern] of forbidden) {
    assert.doesNotMatch(src, pattern, `interactive-effects.ts still contains ${label}; web realization belongs in @nuri/prototype`);
  }
});
