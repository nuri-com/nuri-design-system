/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · SWITCH · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/switch.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { switchDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/switch.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const switchDescriptor = {
  structure: {
    anatomy: {
      el: 'pressable',
      // ONE private part: the thumb (a static view · HOSTS always render).
      parts: {
        thumb: { el: 'view' },
      },
    },
    base: {
      // The track: a 60×36 full-radius pill with a 3px inset, a row stack whose
      // single child stretches to the inner height. disabledOpacity ONLY.
      root: {
        stack: { direction: 'row', align: 'stretch' },
        box: { width: 'xl', height: 'md', padding: 'xs', radius: 'full' },
        interactive: { disabledOpacity: true },
      },
      // The thumb: a square-ratio full-radius disc on the canvas chrome (lifts off
      // either track · decision 44); its height is the stretched inner height.
      thumb: {
        box: { aspectRatio: 'square', radius: 'full' },
        palette: { chrome: 'canvas' },
      },
    },
  },
  variants: {
    // The on/off treatment: colour (variant vs the accent-invariant chrome) + the
    // thumb's park position (justify). The consumer's `checked` bridges onto this.
    state: {
      on: { root: { stack: { justify: 'end' }, palette: { variant: 'solid' } } },
      off: { root: { stack: { justify: 'start' }, palette: { chrome: 'inverse-muted' } } },
    },
  },
  // An unconfigured switch reads as OFF (the safe default · the consumer always
  // passes `checked`). Both projections read this; neither hand-knows a default.
  defaults: { state: 'off' },
  // The PUBLIC API. NO public style axes (one pill, one size · the `state` axis is
  // the target of the `checked` bridge, never an attribute). The root is a
  // `switch`-role pressable (onPress · disabled · the a11y name). NO slots: the
  // control is content-free (`children?: never`), a label belongs to ListSwitch.
  api: {
    axes: [],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', role: 'switch', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    propMaps: { checked: { axis: 'state', true: 'on', false: 'off' } },
    slots: {},
  },
};
