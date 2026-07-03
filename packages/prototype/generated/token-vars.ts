/* ──────────────────────────────────────────────────────────────
 * NURI · TOKEN VARS · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · styles/tokens-semantic.css (the leaf→cssVar map · classifyAll)
 * Emitter · scripts/tokens-parser.js — run `npm run build`
 *
 * The CSS custom-property NAME for every cascade-varying semantic colour
 * leaf (chrome · accent). @nuri/doc reads this to render the Token-map
 * swatch's LIVE `var()` chip — the spec emits the data, @nuri/doc transforms
 * it → Markdown (convergence §5). The dimension scales (space/size/radius)
 * are excluded: the docs render them as literal px, not live swatches.
 * ────────────────────────────────────────────────────────────── */
export const tokenVars = {
  chrome: {
    bgCanvas: '--nuri-bg-canvas',
    bgSubtle: '--nuri-bg-subtle',
    bgStrong: '--nuri-bg-strong',
    bgPressed: '--nuri-bg-pressed',
    bgInverse: '--nuri-bg-inverse',
    bgInverseMuted: '--nuri-bg-inverse-muted',
    textPrimary: '--nuri-text-primary',
    textMuted: '--nuri-text-muted',
    textOnInverse: '--nuri-text-on-inverse',
    borderSubtle: '--nuri-border-subtle',
    borderDefault: '--nuri-border-default',
    borderStrong: '--nuri-border-strong',
    focusRing: '--nuri-focus-ring',
  },
  accent: {
    fg: '--nuri-accent-fg',
    solid: '--nuri-accent-solid',
    solidPressed: '--nuri-accent-solid-pressed',
    onSolid: '--nuri-accent-on-solid',
    bgSubtle: '--nuri-accent-bg-subtle',
    bgSubtlePressed: '--nuri-accent-bg-subtle-pressed',
  },
} as const;
