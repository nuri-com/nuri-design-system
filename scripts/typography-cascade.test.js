/* ══════════════════════════════════════════════════════════════════
 * NURI · TYPOGRAPHY DE-FUSION · COMPUTED-EQUIVALENCE HARNESS (N+45 · decision 77)
 * ──────────────────────────────────────────────────────────────────
 * The gate that lets the type axis de-fuse `size`×`emphasis` (the fused 12-key
 * `TypeKey` → 6 orthogonal sizes + one emphasis override) WITHOUT moving any
 * value. This is NOT byte-identical (the selector shape changes on purpose); the
 * gate is COMPUTED-EQUIVALENCE — every (size, emphasis) renders the SAME computed
 * style before and after. The N+30/N+31 flip pattern (dimension-cascade.test.js):
 * an INDEPENDENT restated oracle, resolved through the live var() chain.
 *
 *   A · SHAPE — styles/typography.css is exactly 6 `[data-type-style="{size}"]`
 *       rules + 1 `[data-type-emphasis]` rule (the fused `.nuri-type-{step}` /
 *       `--em` classes are RETIRED · 12 selectors → 6 + 1).
 *   B · ORDER IS LOAD-BEARING — `[data-type-emphasis]` is source-order-LAST and
 *       equal-specificity (0,1,0) to the size rules; both declare `font-weight`,
 *       so the cascade's source-order tiebreak lets the override win (decision 74's
 *       interactive order-guard pattern recurs). The structural half; the real
 *       browser confirms the applied result (typography-defuse-computed-check.html).
 *   C · COMPUTED-EQUIVALENCE — the de-fused rules, resolved through the live
 *       var() chain, reproduce the OLD 12-key fused composites EXACTLY (the
 *       independent oracle below). The substantive guard: a wrong var ref or a
 *       primitive drift fails here.
 *   D · RETIREMENT — the per-size `--nuri-type-*-em-weight` primitives are gone;
 *       emphasis references the ONE uniform `--nuri-font-weight-semibold` (the
 *       orthogonality · P11).
 *
 * Run:  node --test pipeline/typography-cascade.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const __dirname = dirname(fileURLToPath(import.meta.url));
// N+62 (decision 80): the token CSS is the web projection's output now
// (@nuri/prototype/generated/styles/ · was @nuri/spec's styles/).
const PROTO_GENERATED = resolve(__dirname, '../packages/prototype/generated');
const TYPOGRAPHY_CSS = resolve(PROTO_GENERATED, 'styles/typography.css');
const PRIMITIVE_CSS = resolve(PROTO_GENERATED, 'styles/tokens-primitive.css');

const typoCss = readFileSync(TYPOGRAPHY_CSS, 'utf8');
const primCss = readFileSync(PRIMITIVE_CSS, 'utf8');

const TYPE_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '3xl'];

// ── The INDEPENDENT design oracle · RESTATED here (not read from the CSS or the
// SoT). Each size's resolved composite at the 16px root: fontSize px · lineHeight
// (unitless ratio) · letterSpacing (em) · the REGULAR weight 400. emphasis swaps
// ONLY the weight → the single semibold override (600). If a value here disagrees
// with the CSS chain, one is wrong. ──
const ORACLE = {
  xs:    { fontSizePx: 13, lineHeight: 1.38, letterSpacingEm: 0,      weight: '400' },
  sm:    { fontSizePx: 15, lineHeight: 1.33, letterSpacingEm: -0.01,  weight: '400' },
  md:    { fontSizePx: 17, lineHeight: 1.29, letterSpacingEm: -0.02,  weight: '400' },
  lg:    { fontSizePx: 22, lineHeight: 1.27, letterSpacingEm: -0.015, weight: '400' },
  xl:    { fontSizePx: 30, lineHeight: 1.20, letterSpacingEm: -0.015, weight: '400' },
  '3xl': { fontSizePx: 57, lineHeight: 1.19, letterSpacingEm: -0.02,  weight: '400' },
};
const EMPHASIS_WEIGHT = '600'; // the uniform regular→semibold override (operator-locked)

// The OLD 12-key fused scale this de-fusion REPLACES — derived from the oracle.
// `${size}` = the regular composite; `${size}Em` = the same metrics, weight 600.
// The de-fused realization (a size rule + the emphasis override) must reproduce
// each one EXACTLY — that is computed-equivalence (the rendered output unchanged).
const FUSED_ORACLE = {};
for (const s of TYPE_SIZES) {
  const o = ORACLE[s];
  const metrics = { fontSizePx: o.fontSizePx, lineHeight: o.lineHeight, letterSpacingEm: o.letterSpacingEm };
  FUSED_ORACLE[s] = { ...metrics, weight: '400' };
  FUSED_ORACLE[`${s}Em`] = { ...metrics, weight: EMPHASIS_WEIGHT };
}

// ── resolve a var() chain through the primitive map to its literal (the N+31
// dimension-cascade resolver) ──
const varMap = new Map();
postcss.parse(primCss).walkDecls((d) => {
  if (d.prop.startsWith('--nuri-')) varMap.set(d.prop, d.value.trim());
});
function resolveRhs(rhs, depth = 0) {
  if (depth > 8) throw new Error(`var() chain too deep at '${rhs}'`);
  const m = rhs.match(/^var\((--[\w-]+)\)$/);
  if (!m) return rhs;
  const next = varMap.get(m[1]);
  assert.ok(next !== undefined, `unresolved ${m[1]}`);
  return resolveRhs(next, depth + 1);
}
const round3 = (n) => Math.round(n * 1000) / 1000;
const remToPx = (raw) =>
  raw.endsWith('rem') ? round3(Number(raw.slice(0, -3)) * 16)
  : raw.endsWith('px') ? round3(Number(raw.slice(0, -2)))
  : round3(Number(raw));
const emToNum = (raw) => round3(Number(raw.endsWith('em') ? raw.slice(0, -2) : raw));

// ── parse typography.css → the ordered rule list (source order is load-bearing) ──
const rules = [];
postcss.parse(typoCss).walkRules((r) => {
  const decls = new Map();
  r.walkDecls((d) => decls.set(d.prop, d.value.trim()));
  rules.push({ selector: r.selector.trim(), decls });
});
const sizeRule = (s) => rules.find((r) => r.selector === `[data-type-style="${s}"]`);
const emphasisRule = () => rules.find((r) => r.selector === '[data-type-emphasis]');

// The de-fused realization resolved from the live CSS: a size rule's 4 metrics +
// weight, through the var() chain (the same chain the browser walks).
function resolveSizeRule(s) {
  const d = sizeRule(s).decls;
  return {
    fontSizePx: remToPx(resolveRhs(d.get('font-size'))),
    lineHeight: round3(Number(resolveRhs(d.get('line-height')))),
    letterSpacingEm: emToNum(resolveRhs(d.get('letter-spacing'))),
    weight: resolveRhs(d.get('font-weight')),
  };
}

// ══════════════════════════════════════════════════════════════════
// Guard A · SHAPE (6 [data-type-style] rules + 1 [data-type-emphasis] · de-fused)
// ══════════════════════════════════════════════════════════════════
test('Guard A · the type scale is 6 [data-type-style] rules + 1 [data-type-emphasis] rule (de-fused · decision 77)', () => {
  const styleRules = rules.filter((r) => r.selector.startsWith('[data-type-style='));
  assert.equal(styleRules.length, 6, 'expected exactly 6 [data-type-style] rules');
  for (const s of TYPE_SIZES) assert.ok(sizeRule(s), `missing [data-type-style="${s}"]`);

  const emRules = rules.filter((r) => r.selector === '[data-type-emphasis]');
  assert.equal(emRules.length, 1, 'expected exactly 1 [data-type-emphasis] rule');

  // the fused .nuri-type-{step} / --em utility classes are RETIRED (12 → 6 + 1).
  assert.equal(
    rules.filter((r) => /\.nuri-type-/.test(r.selector)).length, 0,
    'the fused .nuri-type-{step} / --em classes must be retired (decision 77)',
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard B · ORDER IS LOAD-BEARING (emphasis source-order-last · equal specificity)
// ══════════════════════════════════════════════════════════════════
test('Guard B · [data-type-emphasis] is source-order-LAST and equal-specificity — the font-weight tiebreak (decision 77)', () => {
  const idxOf = (sel) => rules.findIndex((r) => r.selector === sel);
  const emIdx = idxOf('[data-type-emphasis]');
  const lastSizeIdx = Math.max(...TYPE_SIZES.map((s) => idxOf(`[data-type-style="${s}"]`)));
  assert.ok(emIdx > lastSizeIdx, 'the emphasis rule must be emitted AFTER every size rule (source order is the tiebreak)');

  // equal specificity (0,1,0): every selector is a SINGLE attribute (no class, no
  // element, no chaining) — so the cascade falls through to source order.
  const singleAttr = /^\[[^\]]+\]$/;
  for (const s of TYPE_SIZES) assert.match(sizeRule(s).selector, singleAttr, `${s} rule must be a single attr selector (0,1,0)`);
  assert.match(emphasisRule().selector, singleAttr, 'emphasis rule must be a single attr selector (0,1,0)');

  // both declare font-weight → the collision the source order resolves.
  assert.ok(emphasisRule().decls.has('font-weight'), 'emphasis rule must declare font-weight');
  for (const s of TYPE_SIZES) {
    assert.ok(sizeRule(s).decls.has('font-weight'), `${s} rule must declare its regular font-weight (the 400 the emphasis overrides)`);
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard C · COMPUTED-EQUIVALENCE (the de-fused rules == the OLD fused composites)
// ══════════════════════════════════════════════════════════════════
test('Guard C · the de-fused rules reproduce the OLD 12-key fused composites EXACTLY (the values are FROZEN · decision 77)', () => {
  const emWeight = resolveRhs(emphasisRule().decls.get('font-weight'));
  for (const s of TYPE_SIZES) {
    const resolvedSize = resolveSizeRule(s);
    // regular = the size rule alone == the old `${s}`.
    assert.deepEqual(resolvedSize, FUSED_ORACLE[s], `de-fused '${s}' (regular) drifted from the old fused composite`);
    // emphasis = the size rule with font-weight overridden by the source-order-last
    // emphasis rule == the old `${s}Em`. The metrics are untouched; only the weight swaps.
    assert.deepEqual(
      { ...resolvedSize, weight: emWeight }, FUSED_ORACLE[`${s}Em`],
      `de-fused '${s}' + emphasis drifted from the old fused '${s}Em' composite`,
    );
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard D · RETIREMENT (per-size em-weight gone · emphasis is the uniform semibold)
// ══════════════════════════════════════════════════════════════════
test('Guard D · the per-size --nuri-type-*-em-weight primitives are RETIRED · emphasis is the uniform semibold (decision 77)', () => {
  for (const s of TYPE_SIZES) {
    assert.ok(
      !varMap.has(`--nuri-type-${s}-em-weight`),
      `--nuri-type-${s}-em-weight must be retired (emphasis is ONE uniform override now · P11)`,
    );
  }
  // the emphasis rule references the shared semibold primitive, not a per-size one.
  assert.equal(
    emphasisRule().decls.get('font-weight'), 'var(--nuri-font-weight-semibold)',
    'the emphasis rule must reference the uniform --nuri-font-weight-semibold',
  );
  assert.equal(
    resolveRhs(emphasisRule().decls.get('font-weight')), EMPHASIS_WEIGHT,
    'the emphasis override must resolve to the semibold weight (600)',
  );
});
