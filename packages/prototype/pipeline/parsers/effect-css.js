/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · EFFECT CSS EMIT
 *
 * The web projection for the semantic `effect` namespace. Spec names only the
 * elevation level; this emitter owns the browser realization.
 * ────────────────────────────────────────────────────────────── */

const EFFECT_ELEVATION = {
  none: null,
  raised: '0 -14px 34px -18px rgba(0, 0, 0, 0.42)',
};

export function emitEffectCss() {
  const rules = Object.entries(EFFECT_ELEVATION)
    .filter(([, shadow]) => shadow !== null)
    .map(([level, shadow]) => `  .nuri-effect[data-elevation="${level}"] { box-shadow: ${shadow}; }`);

  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · NAMESPACE CSS · EFFECT · GENERATED — DO NOT EDIT BY HAND`,
    ` *`,
    ` * GENERATED from the web projection's effect realization table by`,
    ` * prototype/pipeline/css-preview.js. The descriptor schema carries only`,
    ` * semantic effect values; box-shadow is owned by @nuri/prototype.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `@layer tokens {`,
    `  /* Empty by design: effect values are semantic descriptor inputs, not token aliases. */`,
    `}`,
    ``,
    `@layer rules {`,
    `  .nuri-effect { min-width: 0; }`,
    ...rules,
    `}`,
    ``,
  ].join('\n');
}
