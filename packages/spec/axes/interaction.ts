/* ──────────────────────────────────────────────────────────────
 * NURI · INTERACTION BASELINE · SOURCE OF TRUTH (hand-maintained)
 *
 * The TRANSVERSAL cross-component interaction baseline (decision 45):
 * the { pressScale · disabledOpacity } design constants n=3+ components
 * were hardcoding before they were centralized. A CROSS-COMPONENT design
 * constant — NOT button geometry — so it has its own transversal home.
 *
 * Pure data. This is the SoT: the build flips these values INTO the --nuri-interaction-*
 * primitives in styles/tokens-primitive.css (decision 2 reversed for the
 * family · scripts/parsers/interaction.js#flipInteractionCss) AND emits
 * build/interaction.ts from here (the RN factory's reader · decision 48).
 * ONE source, two readers — the values live in exactly one place (projection
 * model §4 · decision 80 · the last CSS-only source for the family is gone).
 * ────────────────────────────────────────────────────────────── */

export const interaction = {
  pressScale: 0.97,
  disabledOpacity: 0.4,
} as const;
