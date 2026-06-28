/* ══════════════════════════════════════════════════════════════════
 * NURI · DIMENSION CASCADE PARITY HARNESS (N+31 · decision 70 · the first flip)
 * ──────────────────────────────────────────────────────────────────
 * Proves the TS dimension SoT (pipeline/dimensions.ts) and the committed token
 * CSS agree, and that the cascade bottoms out at the design scale. This is the
 * gate that lets decision 2 reverse for the dimension layer: until it is green
 * the flip is reversible (the CSS is the oracle); once green the SoT is the
 * source and the CSS is its projection.
 *
 *   A · STRUCTURAL ≡ — the SoT's { cssVar → RHS } map equals the committed CSS's
 *       (declaration maps · the brief's item a). px ← tokens-primitive.css;
 *       space/size/radius ← tokens-semantic.css. A drift between the two on-disk
 *       sources (a hand edit to one) fails here.
 *   B · RE-EMIT FRESHNESS — re-running the in-place emit on the committed CSS is
 *       byte-identical (the L3.1 Guard-B posture · the CSS is the SoT's fresh
 *       output · `npm run build` was run). Non-tautological: the emit takes its
 *       values from the SoT, not the CSS.
 *   C · INDEPENDENT SCALE ORACLE — the design scale numbers are RESTATED here
 *       (not read from the CSS or the SoT) and every leaf is resolved through the
 *       px chain to its final value, two ways: through the SoT (leaf → px ref →
 *       value==name) AND through the live CSS var() chain. Both must equal the
 *       restated oracle (the brief's item b · the L3.1 Guard-C pattern). This is
 *       the substantive guard — if the SoT and CSS both held a wrong value, A/B
 *       pass but C fails.
 *   D · THE LOCK — the reserved radius PRIMITIVES (--nuri-radius-{none,xs,xl,2xl}
 *       · tokens-primitive.css · hand · P11) are present and NOT owned by the SoT
 *       (which owns the space/size/radius SEMANTICS only). Guards the "DO NOT
 *       touch" list + documents the family split (primitive vs semantic radius).
 *
 * Run:  node --test pipeline/dimension-cascade.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import {
  loadDimensions,
  primitiveDimMap,
  semanticDimMap,
  leafRhs,
  rewriteDimensionDecls,
} from './parsers/dimension-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../packages/spec');
const PRIMITIVE_CSS = resolve(REPO_ROOT, 'styles/tokens-primitive.css');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
const DIMENSIONS_SRC = resolve(REPO_ROOT, 'pipeline/dimensions.ts');

const dims = await loadDimensions(DIMENSIONS_SRC);
const primCss = readFileSync(PRIMITIVE_CSS, 'utf8');
const semCss = readFileSync(SEMANTIC_CSS, 'utf8');

// parse a css file → Map<prop, value> for the props matching `re`.
function declMapFromCss(css, re) {
  const map = new Map();
  postcss.parse(css).walkDecls((d) => {
    if (re.test(d.prop)) map.set(d.prop, d.value.trim());
  });
  return map;
}

const sortedEntries = (map) => [...map.entries()].sort(([a], [b]) => a.localeCompare(b));

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (the SoT map ≡ the committed CSS map)
// ══════════════════════════════════════════════════════════════════
test('Guard A · px scale: SoT ≡ committed tokens-primitive.css', () => {
  assert.deepEqual(
    sortedEntries(primitiveDimMap(dims)),
    sortedEntries(declMapFromCss(primCss, /^--nuri-px-/)),
  );
});

test('Guard A · space/size/radius semantics: SoT ≡ committed tokens-semantic.css', () => {
  assert.deepEqual(
    sortedEntries(semanticDimMap(dims)),
    sortedEntries(declMapFromCss(semCss, /^--nuri-(space|size|radius)-/)),
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed CSS == the emit's output · byte-level)
// ══════════════════════════════════════════════════════════════════
test('Guard B · tokens-primitive.css is fresh (re-emit byte-identical)', () => {
  assert.equal(
    rewriteDimensionDecls(primCss, primitiveDimMap(dims), /^--nuri-px-/),
    primCss,
    'tokens-primitive.css dimension decls are stale — run `npm run build -w @nuri/spec`',
  );
});

test('Guard B · tokens-semantic.css is fresh (re-emit byte-identical)', () => {
  assert.equal(
    rewriteDimensionDecls(semCss, semanticDimMap(dims), /^--nuri-(space|size|radius)-/),
    semCss,
    'tokens-semantic.css dimension decls are stale — run `npm run build -w @nuri/spec`',
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard C · INDEPENDENT SCALE ORACLE (restated · resolved both ways)
// ══════════════════════════════════════════════════════════════════
// The design scale, RESTATED by hand — the independent oracle. NOT read from the
// CSS or the SoT module; if a value here disagrees with either, one is wrong.
// These are the FINAL resolved strings (space.none + radius.full are the literal
// sentinels outside the px scale by design · decision 32 / 36.1).
const PX_ORACLE = [2, 4, 6, 12, 18, 24, 28, 36, 48, 60, 72, 90];
const SPACE_FINAL = { none: '0', '2xs': '2px', xs: '4px', sm: '6px', md: '12px', lg: '18px', xl: '24px', '2xl': '36px' };
const SIZE_FINAL = { xs: '18px', sm: '24px', md: '36px', lg: '48px', xl: '60px', '2xl': '72px', '3xl': '90px' };
const RADIUS_FINAL = { sm: '6px', md: '12px', lg: '18px', full: '9999px' };

test('Guard C · the px scale equals the restated design oracle', () => {
  // The KEYS of `px` are the scale (the DTCG shape · value == name · decision 32).
  assert.deepEqual(Object.keys(dims.px).map(Number), PX_ORACLE);
});

test('Guard C · every semantic leaf resolves to the design value — through the SoT', () => {
  // SoT resolution: leaf → leafRhs → (a px ref resolves via value==name) → final.
  const sotResolve = (def) => {
    const rhs = leafRhs(def);
    const m = rhs.match(/^var\(--nuri-px-(\d+)\)$/);
    if (!m) return rhs; // a literal (0 · 9999px)
    const n = Number(m[1]);
    assert.ok(Object.hasOwn(dims.px, n), `--nuri-px-${n} referenced but absent from px`);
    return `${n}px`; // decision 32 · value == name
  };
  for (const [scale, table, final] of [['space', dims.space, SPACE_FINAL], ['size', dims.size, SIZE_FINAL], ['radius', dims.radius, RADIUS_FINAL]]) {
    for (const [leaf, def] of Object.entries(table)) {
      assert.equal(sotResolve(def), final[leaf], `${scale}.${leaf} resolved through the SoT`);
    }
    assert.deepEqual(Object.keys(table).sort(), Object.keys(final).sort(), `${scale} leaf set`);
  }
});

test('Guard C · every semantic leaf resolves to the design value — through the live CSS var() chain', () => {
  // Build a var map from the COMMITTED CSS and chase the generated chain end to
  // end (the actual --nuri-{scale}-leaf → var(--nuri-px-N) → Npx the browser sees).
  const varMap = new Map();
  for (const css of [primCss, semCss]) {
    postcss.parse(css).walkDecls((d) => {
      if (d.prop.startsWith('--nuri-')) varMap.set(d.prop, d.value.trim());
    });
  }
  const resolveRhs = (rhs, depth = 0) => {
    if (depth > 8) throw new Error(`var() chain too deep at '${rhs}'`);
    const m = rhs.match(/^var\((--[\w-]+)\)$/);
    if (!m) return rhs;
    const next = varMap.get(m[1]);
    assert.ok(next !== undefined, `unresolved ${m[1]}`);
    return resolveRhs(next, depth + 1);
  };
  for (const [scale, final] of [['space', SPACE_FINAL], ['size', SIZE_FINAL], ['radius', RADIUS_FINAL]]) {
    for (const [leaf, expected] of Object.entries(final)) {
      const rhs = varMap.get(`--nuri-${scale}-${leaf}`);
      assert.ok(rhs !== undefined, `--nuri-${scale}-${leaf} missing from the CSS`);
      assert.equal(resolveRhs(rhs), expected, `--nuri-${scale}-${leaf} resolved through the live CSS`);
    }
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard D · THE LOCK (reserved radius primitives present + not owned)
// ══════════════════════════════════════════════════════════════════
test('Guard D · the reserved radius PRIMITIVES are present and NOT owned by the SoT', () => {
  // They live in tokens-primitive.css (a different family than the semantic
  // radius the SoT owns) — hand-authored, reserved per P11, never touched.
  const reserved = declMapFromCss(primCss, /^--nuri-radius-/);
  assert.deepEqual(
    [...reserved.keys()].sort(),
    ['--nuri-radius-2xl', '--nuri-radius-none', '--nuri-radius-xl', '--nuri-radius-xs'],
    'the reserved radius primitive set changed — it is LOCKED (hand · P11)',
  );
  const owned = semanticDimMap(dims);
  for (const k of reserved.keys()) {
    assert.ok(!owned.has(k), `${k} is a reserved PRIMITIVE — the SoT must not own it`);
  }
});
