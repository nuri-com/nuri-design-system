/* ──────────────────────────────────────────────────────────────
 * NURI · TYPE SCALE EMITTER (Node)
 *
 * Emits the `type` namespace into packages/rn/generated/tokens.ts — a TYPED, per-step
 * composite of the type scale. RE-SOURCED at N+52 (decision 78 · the
 * type-composite flip): the scale comes from the TS SoT
 * (packages/spec/tokens/typography.ts · decision 2 reversed for the type composite),
 * a self-contained INLINE table of text styles — fontSize px · lineHeight
 * ratio · letterSpacing em are taken STRAIGHT from it; only the weight
 * NAME ('regular') is resolved to its literal ('400') against the primitive
 * map (--nuri-font-weight-* stays a hand-CSS primitive · the one value the
 * scale still references). The same SoT also GENERATES the --nuri-type-*
 * CSS in place, DE-REFERENCED to inline (parsers/type-css.js · size →
 * 1.0625rem · weight → 400), which the web side consumes through
 * styles/typography.css ([data-type-style] · zero-build); this emit is the
 * RN runtime's reader. ONE source, TWO readers (the icon model · decision 48).
 *
 * Unlike the cascade-resolved groups in tokens.ts, `type` is NOT a
 * runtime/TokenPath set — it's a context-invariant, directly-accessed
 * nested namespace (like `icons`): the consumer spreads `type[size]`
 * straight into a Text style. A drift guard in tokens-parser.test.js
 * re-derives every value from the SoT (the restated-scale oracle).
 *
 * lineHeight AND letterSpacing stay RELATIVE — verbatim from the
 * source (a unitless ratio · an em number). RN's lineHeight /
 * letterSpacing are absolute dp that do NOT scale with fontSize or the
 * OS fontScale, so baking either to absolute here would clip/cramp at
 * large accessibility text sizes and break web↔RN scaling parity (the
 * web scales both natively). The relative→absolute conversion lives in
 * ONE place on the consumer side — the `typeStyle(key)` helper — which
 * is also where a `* fontScale` multiply goes when Dynamic Type lands
 * (not now · P11). Per-leaf:
 *   · fontSize       px, straight from the SoT (17)
 *   · lineHeight     UNITLESS ratio, verbatim (1.29) — × fontSize in typeStyle
 *   · letterSpacing  em number, verbatim (-0.02; xs = 0) — × fontSize in typeStyle
 *   · fontWeight     the regular weight NAME resolved to its literal string ('400').
 *
 * EMPHASIS is ORTHOGONAL (decision 77 · the N+45 de-fusion): the regular→semibold
 * override is UNIFORM across every size (all 6 leaves resolved --nuri-font-weight-
 * semibold · operator-locked), so it emits as ONE sibling `emphasisWeight` ('600'),
 * NOT a per-size `${step}Em` weight (P11 · no speculative split). Was 12 fused keys
 * (6 × {regular, em}); now 6 size composites + one weight override.
 * ────────────────────────────────────────────────────────────── */

import { resolveValue } from './semantic.js';

// The scale steps — xs · sm · md · lg · xl · 3xl (2xl is a deliberate
// reserved gap · tokens-primitive.css). Deterministic order so the
// emit is byte-stable across builds (the drift guard compares re-emit).
export const TYPE_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '3xl'];

// Round to 3 decimals — matches components.js#remToPx so the px
// numbers agree leaf-for-leaf with the per-component emit.
function round3(n) {
  return Math.round(n * 1000) / 1000;
}

// Resolve the type scale from the TS SoT + the primitive map → { sizes,
// emphasisWeight }: the 6 size composites (regular weight) keyed by step, plus
// the single orthogonal emphasis weight override (decision 77 · uniform 400→600).
// The SoT (packages/spec/tokens/typography.ts · loaded by the orchestrator) is the readable
// inline table — fontSize px · lineHeight ratio · letterSpacing em are taken
// STRAIGHT from it (no CSS read); only the weight NAME is resolved to its literal
// against `primitiveMap` (--nuri-font-weight-* stays a hand-CSS primitive · the
// one value the type scale still references). Throws loudly if the weight (or the
// semibold emphasis weight) dangles, so a renamed/dropped primitive surfaces at
// build rather than a silent partial scale.
export function buildTypeScale(typeSoT, primitiveMap) {
  const sizes = {};
  for (const step of TYPE_SIZES) {
    const def = typeSoT[step];
    if (def == null) {
      throw new Error(`type scale: step '${step}' is missing from the TS SoT (packages/spec/tokens/typography.ts)`);
    }
    const wRaw = resolveValue(primitiveMap.get(`--nuri-font-weight-${def.weight}`), primitiveMap);
    if (wRaw == null) {
      throw new Error(
        `type scale step '${step}' weight '${def.weight}' is unresolved ` +
        `(--nuri-font-weight-${def.weight} missing from the primitives)`,
      );
    }
    sizes[step] = {
      fontSize: round3(def.fontSize),
      lineHeight: round3(def.lineHeight),
      fontWeight: wRaw,
      letterSpacing: round3(def.letterSpacing),
    };
  }
  // The emphasis override · ONE value, the semibold weight (decision 77 · P11).
  const emphasisWeight = resolveValue(primitiveMap.get('--nuri-font-weight-semibold'), primitiveMap);
  if (emphasisWeight == null) {
    throw new Error('type scale: --nuri-font-weight-semibold is unresolved (the emphasis weight override)');
  }
  return { sizes, emphasisWeight };
}

// Emit the `type` namespace + the `emphasisWeight` override (string) appended
// into packages/rn/generated/tokens.ts. Mirrors the icon emit: a typed, directly-accessed
// namespace whose values are a machine-checkable function of the single source.
export function emitTypeTs({ sizes, emphasisWeight }) {
  const weights = [...new Set([...Object.values(sizes).map((s) => s.fontWeight), emphasisWeight])]
    .sort()
    .map((w) => `'${w}'`)
    .join(' | ');

  const lines = [
    `/* ── type · ${TYPE_SIZES.length} size composites + emphasisWeight · directly-accessed namespace (decision 54 · de-fused 77) ──`,
    ` *`,
    ` * Source · styles/tokens-primitive.css --nuri-type-* (the SAME`,
    ` * primitives the web reads through styles/typography.css · zero-build).`,
    ` * One source, two readers (the icon model · decision 48). NOT a runtime/`,
    ` * TokenPath set.`,
    ` *`,
    ` * fontSize px (rem×16) · lineHeight UNITLESS ratio (verbatim) ·`,
    ` * letterSpacing em number (verbatim) · fontWeight the resolved REGULAR`,
    ` * weight literal. lineHeight + letterSpacing stay RELATIVE so they scale`,
    ` * with fontSize / OS fontScale; the consumer's typeStyle(size, emphasis)`,
    ` * helper does the × fontSize relative→absolute conversion (do NOT raw-spread`,
    ` * type[size] — lineHeight 1.29 would read as ~1px). EMPHASIS is ORTHOGONAL`,
    ` * (decision 77 · the N+45 de-fusion · uniform 400→600): the single`,
    ` * emphasisWeight override below, applied by typeStyle's 2nd arg (RN) / the`,
    ` * source-order-last [data-type-emphasis] rule (web). Every value is verbatim`,
    ` * from the source primitives — enforced by the sync test. */`,
    `export type TypeSize = ${TYPE_SIZES.map((s) => `'${s}'`).join(' | ')};`,
    `export type TypeWeight = ${weights};`,
    `export type TypeStep = {`,
    `  fontSize: number;`,
    `  lineHeight: number;`,
    `  fontWeight: TypeWeight;`,
    `  letterSpacing: number;`,
    `};`,
    ``,
    `export const type: Record<TypeSize, TypeStep> = {`,
  ];
  for (const step of TYPE_SIZES) {
    const s = sizes[step];
    lines.push(
      `  ${fmtKey(step)}: { fontSize: ${s.fontSize}, lineHeight: ${s.lineHeight}, ` +
      `fontWeight: '${s.fontWeight}', letterSpacing: ${s.letterSpacing} },`,
    );
  }
  lines.push(`};`);
  lines.push('');
  lines.push(`// emphasis · the orthogonal regular→semibold weight override (decision 77 ·`);
  lines.push(`// uniform across every size · P11). typeStyle(size, true) swaps fontWeight to`);
  lines.push(`// this; web realizes it as the source-order-last [data-type-emphasis] rule.`);
  lines.push(`export const emphasisWeight: TypeWeight = '${emphasisWeight}';`);
  lines.push('');
  return lines.join('\n');
}

// Quote a key if it isn't a valid bare JS identifier ('3xl' starts with a
// digit). Mirrors semantic.js#fmtKey.
function fmtKey(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : `'${name}'`;
}
