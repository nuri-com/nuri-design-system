/* ──────────────────────────────────────────────────────────────
 * NURI · TYPE SCALE EMITTER (Node)
 *
 * Emits the `type` namespace into build/tokens.ts — a TYPED, per-step
 * composite of the type scale — from the --nuri-type-* primitives in
 * styles/tokens-primitive.css (the single source · decision 34's type
 * primitives, reclassified at decision 54). The web side consumes the
 * SAME primitives through the .nuri-type-* utility classes
 * (styles/typography.css · zero-build); this emit is the RN runtime's
 * reader. ONE source, TWO readers (the icon model · decision 48).
 *
 * Unlike the cascade-resolved groups in tokens.ts, `type` is NOT a
 * runtime/TokenPath set — it's a context-invariant, directly-accessed
 * nested namespace (like `icons`): the consumer spreads `type[size]`
 * straight into a Text style. A drift guard in tokens-parser.test.js
 * re-derives every value from the source primitives.
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
 *   · fontSize       rem → px at the 16px root baseline (1.0625rem → 17)
 *   · lineHeight     UNITLESS ratio, verbatim (1.29) — × fontSize in typeStyle
 *   · letterSpacing  em number, verbatim (-0.02; xs = 0) — × fontSize in typeStyle
 *   · fontWeight     the resolved weight literal as a quoted string
 *                    ('400' regular · '600' em).
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

// rem → px at the 16px root baseline (mirror components.js#remToPx ·
// decision 34: --nuri-font-size-17 = 1.0625rem → 17). Also accepts a
// bare px literal or a unitless number for robustness.
function lengthToPx(raw) {
  if (raw.endsWith('rem')) return round3(Number(raw.slice(0, -3)) * 16);
  if (raw.endsWith('px')) return round3(Number(raw.slice(0, -2)));
  return round3(Number(raw));
}

// tracking → the em number, verbatim. '-0.02em' → -0.02 · '0' → 0.
// Kept relative (NOT × size) so it scales with fontSize / fontScale at
// the consumer · typeStyle does the × fontSize conversion.
function trackingToEm(raw) {
  return round3(raw.endsWith('em') ? Number(raw.slice(0, -2)) : Number(raw));
}

// Resolve the per-step composite from the primitive map. Returns a
// record keyed by every step AND its `${step}Em` twin (the --em
// weight). Throws loudly if any --nuri-type-* primitive dangles, so a
// renamed/dropped source surfaces at build rather than emitting a
// silent partial scale.
export function buildTypeScale(primitiveMap) {
  const out = {};
  for (const step of TYPE_SIZES) {
    const sizeRaw  = resolveValue(primitiveMap.get(`--nuri-type-${step}-size`), primitiveMap);
    const lhRaw    = resolveValue(primitiveMap.get(`--nuri-type-${step}-line-height`), primitiveMap);
    const trackRaw = resolveValue(primitiveMap.get(`--nuri-type-${step}-tracking`), primitiveMap);
    const wRaw     = resolveValue(primitiveMap.get(`--nuri-type-${step}-weight`), primitiveMap);
    const emWRaw   = resolveValue(primitiveMap.get(`--nuri-type-${step}-em-weight`), primitiveMap);
    if ([sizeRaw, lhRaw, trackRaw, wRaw, emWRaw].some((v) => v == null)) {
      throw new Error(
        `type scale step '${step}' has an unresolved --nuri-type-* primitive ` +
        `(size=${sizeRaw} lh=${lhRaw} tracking=${trackRaw} weight=${wRaw} em-weight=${emWRaw})`,
      );
    }
    const fontSize = lengthToPx(sizeRaw);
    const lineHeight = round3(Number(lhRaw));
    const letterSpacing = trackingToEm(trackRaw);
    out[step]         = { fontSize, lineHeight, fontWeight: wRaw, letterSpacing };
    out[`${step}Em`]  = { fontSize, lineHeight, fontWeight: emWRaw, letterSpacing };
  }
  return out;
}

// Emit the `type` namespace block (string) appended into build/tokens.ts.
// Mirrors the icon emit: a typed, directly-accessed namespace whose
// values are a machine-checkable function of the single source.
export function emitTypeTs(scale) {
  const keys = Object.keys(scale);
  const weights = [...new Set(keys.map((k) => scale[k].fontWeight))]
    .sort()
    .map((w) => `'${w}'`)
    .join(' | ');

  const lines = [
    `/* ── type · ${TYPE_SIZES.length} steps × {regular, em} · directly-accessed namespace (decision 54) ──`,
    ` *`,
    ` * Source · styles/tokens-primitive.css --nuri-type-* (the SAME`,
    ` * primitives the web reads through the .nuri-type-* utility classes`,
    ` * in styles/typography.css · zero-build). One source, two readers`,
    ` * (the icon model · decision 48). NOT a runtime/TokenPath set.`,
    ` *`,
    ` * fontSize px (rem×16) · lineHeight UNITLESS ratio (verbatim) ·`,
    ` * letterSpacing em number (verbatim) · fontWeight the resolved weight`,
    ` * literal. lineHeight + letterSpacing stay RELATIVE so they scale with`,
    ` * fontSize / OS fontScale; the consumer's typeStyle(key) helper does`,
    ` * the × fontSize relative→absolute conversion (do NOT raw-spread`,
    ` * type[key] — lineHeight 1.29 would read as ~1px). Every value is`,
    ` * verbatim from the source primitives — enforced by the sync test. */`,
    `export type TypeSize = ${TYPE_SIZES.map((s) => `'${s}'`).join(' | ')};`,
    `export type TypeWeight = ${weights};`,
    `export type TypeStep = {`,
    `  fontSize: number;`,
    `  lineHeight: number;`,
    `  fontWeight: TypeWeight;`,
    `  letterSpacing: number;`,
    `};`,
    ``,
    `export const type: Record<TypeSize | \`\${TypeSize}Em\`, TypeStep> = {`,
  ];
  for (const key of keys) {
    const s = scale[key];
    lines.push(
      `  ${fmtKey(key)}: { fontSize: ${s.fontSize}, lineHeight: ${s.lineHeight}, ` +
      `fontWeight: '${s.fontWeight}', letterSpacing: ${s.letterSpacing} },`,
    );
  }
  lines.push(`};`);
  lines.push('');
  return lines.join('\n');
}

// Quote a key if it isn't a valid bare JS identifier ('3xl' / '3xlEm'
// start with a digit). Mirrors semantic.js#fmtKey.
function fmtKey(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : `'${name}'`;
}
