/* ──────────────────────────────────────────────────────────────
 * NURI · INTERACTION BASELINE · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · pipeline/interaction.ts (the interaction baseline SoT)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * The TRANSVERSAL cross-component interaction baseline (decision 45):
 * the { pressScale · disabledOpacity } design constants, flattened from
 * the pipeline/interaction.ts SoT (the SAME values the build flips into the
 * --nuri-interaction-* CSS primitives · one source, two readers · decision
 * 48). A single transversal emit — the RN factory's theme reads it directly,
 * instead of reaching into a per-component file for a non-component value
 * (Smell-1 · decision 66 arc #0). NOT a runtime/TokenPath set; the values
 * are context-invariant.
 * ────────────────────────────────────────────────────────────── */

export const interaction = {
  pressScale:       0.97,
  disabledOpacity:  0.4,
} as const;
