/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · LIST-SWITCH · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/list-switch.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { listSwitchDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/list-switch.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const listSwitchDescriptor = {
  structure: {
    anatomy: {
      el: 'pressable',
      parts: {
        // The content column (the list-action twin): title over the muted line.
        content: { el: 'view', parts: { text: { el: 'text' }, textMuted: { el: 'text' } } },
        // The trailing pill: a STATIC track hosting the thumb (the switch.ts copy).
        track: { el: 'view', parts: { thumb: { el: 'view' } } },
      },
    },
    base: {
      // The row (≡ list-action root): the ghost wash + disabled dim on the ONE control.
      root: {
        stack: { direction: 'row', align: 'center', gap: 'md' },
        box: { padding: 'md', radius: 'lg' },
        palette: { variant: 'ghost' },
        interactive: { pressColor: true, disabledOpacity: true },
      },
      content: {
        stack: { direction: 'column', align: 'stretch', justify: 'center', fill: 'grow-shrink' },
      },
      text: { typography: { size: 'md', emphasis: true, align: 'start', flow: 'truncate', lines: 1 } },
      textMuted: { typography: { size: 'sm', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      // ── The switch look · VERBATIM switch.ts root/thumb minus `interactive` ──
      track: {
        stack: { direction: 'row', align: 'stretch' },
        box: { width: 'xl', height: 'md', padding: 'xs', radius: 'full' },
      },
      thumb: {
        box: { aspectRatio: 'square', radius: 'full' },
        palette: { chrome: 'canvas' },
      },
    },
  },
  variants: {
    // ≡ switch.ts `state`, re-targeted from `root` to `track` (the guard pins it).
    state: {
      on: { track: { stack: { justify: 'end' }, palette: { variant: 'solid' } } },
      off: { track: { stack: { justify: 'start' }, palette: { chrome: 'inverse-muted' } } },
    },
  },
  defaults: { state: 'off' },
  // The PUBLIC API: no style axes; the `switch`-role pressable root (onPress ·
  // disabled · an OPTIONAL a11y label — the row text names the control); the
  // `checked` bridge; TWO text composition slots (the list-action content twins).
  api: {
    axes: [],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', role: 'switch', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    propMaps: { checked: { axis: 'state', true: 'on', false: 'off' } },
    slots: {
      text: { part: 'text', kind: 'text', component: true, multiple: true },
      textMuted: { part: 'textMuted', kind: 'text', component: true, multiple: true },
    },
  },
};
