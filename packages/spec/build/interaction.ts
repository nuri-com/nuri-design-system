/* ──────────────────────────────────────────────────────────────
 * NURI · INTERACTION BASELINE · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · styles/tokens-primitive.css --nuri-interaction-*
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * The TRANSVERSAL cross-component interaction baseline (decision 45):
 * the { pressScale · disabledOpacity } design constants, read from the
 * --nuri-interaction-* primitive family (classified primitive.interaction
 * in pipeline/parsers/semantic.js). A single transversal emit — the RN
 * factory's theme reads it directly, instead of reaching into a
 * per-component file for a non-component value (Smell-1 · decision 66
 * arc #0). NOT a runtime/TokenPath set; the values are context-invariant.
 * ────────────────────────────────────────────────────────────── */

export const interaction = {
  pressScale:       0.97,
  disabledOpacity:  0.4,
} as const;
