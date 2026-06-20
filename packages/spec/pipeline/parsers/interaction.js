/* ──────────────────────────────────────────────────────────────
 * NURI · INTERACTION BASELINE EMITTER (Node)
 *
 * Emits build/interaction.ts — the TRANSVERSAL interaction baseline
 * { pressScale · disabledOpacity } as a directly-accessed const, read
 * from the --nuri-interaction-* primitive family in
 * styles/tokens-primitive.css (the cross-component design constants ·
 * decision 45 · classified primitive.interaction in semantic.js).
 *
 * Why its OWN emit (Smell-1 · decision 66 arc #0): these two numerics
 * are a decision-45 CROSS-COMPONENT constant, not button geometry. The
 * pipeline previously pipeline-inlined them into every consumer's
 * per-component file (build/components/{button,icon-button,…}.ts), and
 * the factory reached into `button` for them — a non-button value homed
 * in a per-component file (the R1 "no transversal interaction artifact"
 * finding). This emit gives the family a transversal home the factory
 * reads directly; the per-component files are retired.
 *
 * Reads from the primitive map (never hardcodes the values) so the emit
 * can only ever say what the CSS SoT says. ONE source, two readers (the
 * icon model · decision 48): the web consumes --nuri-interaction-* via
 * the per-component `@layer tokens` aliases; this is the RN reader.
 * ────────────────────────────────────────────────────────────── */

import { resolveValue } from './semantic.js';

// leaf identifier → the --nuri-interaction-* primitive it reads. The
// order here is the emit order (byte-stable across builds · the drift
// guard compares re-emit).
export const INTERACTION_PRIMITIVES = {
  pressScale:      '--nuri-interaction-press-scale',
  disabledOpacity: '--nuri-interaction-disabled-opacity',
};

// Resolve one --nuri-interaction-* primitive to its numeric literal.
// These are bare unitless numbers (0.97 · 0.4) — no var() chain, no
// unit. Throws loudly if a value goes missing or stops being numeric so
// a renamed/retyped primitive surfaces at build, not in a silent emit.
function readInteractionLiteral(primitiveMap, cssVar) {
  const raw = resolveValue(primitiveMap.get(cssVar), primitiveMap);
  if (raw == null || !/^-?\d+(?:\.\d+)?$/.test(raw)) {
    throw new Error(
      `interaction primitive ${cssVar} did not resolve to a numeric literal ` +
      `(got ${raw}). The --nuri-interaction-* family is the cross-component ` +
      `design-constant SoT (decision 45) — check tokens-primitive.css.`,
    );
  }
  return raw;
}

// Build the { pressScale, disabledOpacity } record from the primitive
// map. Returns the validated raw literals as strings (emitted verbatim
// so the JS numbers match the CSS exactly — 0.97 / 0.4).
export function buildInteraction(primitiveMap) {
  const out = {};
  for (const [leaf, cssVar] of Object.entries(INTERACTION_PRIMITIVES)) {
    out[leaf] = readInteractionLiteral(primitiveMap, cssVar);
  }
  return out;
}

// Emit the build/interaction.ts source (string). The caller owns the
// file write (mirrors the emitTokensTs / emitTypeTs pattern).
export function emitInteractionTs(interaction) {
  const entries = Object.entries(interaction);
  const width = Math.max(...entries.map(([k]) => k.length)) + 1; // + ':'
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · INTERACTION BASELINE · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · styles/tokens-primitive.css --nuri-interaction-*`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * The TRANSVERSAL cross-component interaction baseline (decision 45):`,
    ` * the { pressScale · disabledOpacity } design constants, read from the`,
    ` * --nuri-interaction-* primitive family (classified primitive.interaction`,
    ` * in pipeline/parsers/semantic.js). A single transversal emit — the RN`,
    ` * factory's theme reads it directly, instead of reaching into a`,
    ` * per-component file for a non-component value (Smell-1 · decision 66`,
    ` * arc #0). NOT a runtime/TokenPath set; the values are context-invariant.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `export const interaction = {`,
  ];
  for (const [leaf, value] of entries) {
    lines.push(`  ${`${leaf}:`.padEnd(width + 1)} ${value},`);
  }
  lines.push(`} as const;`);
  lines.push('');
  return lines.join('\n');
}
