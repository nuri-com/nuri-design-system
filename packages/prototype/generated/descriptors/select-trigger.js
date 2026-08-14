/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · SELECT-TRIGGER · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/select-trigger.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { selectTriggerDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/select-trigger.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const selectTriggerDescriptor = {
  structure: {
    anatomy: {
      el: 'pressable',
      parts: {
        label: { el: 'text' },
        avatar: {
          component: 'icon-avatar',
          props: {
            variant: '$slot.variant|outline',
            size: 'sm',
            accent: '$slot.accent',
            icon: '$slot.name',
            source: '$slot.source',
          },
        },
        value: { el: 'text' },
        chevron: { el: 'icon' },
      },
    },
    base: {
      root: {
        stack: { direction: 'row', align: 'center', fill: 'hug' },
        box: { minHeight: 'lg', radius: 'full' },
        interactive: { pressColor: true, pressScale: true, disabledOpacity: true },
      },
      label: {
        typography: { size: 'sm', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      value: {
        stack: { fill: 'grow-shrink' },
        typography: { size: 'sm', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      chevron: {
        box: { width: 'xs', height: 'xs' },
      },
    },
  },
  variants: {
    variant: {
      ghost: {
        root: { stack: { gap: 'xs' }, palette: { variant: 'ghost' } },
      },
      subtle: {
        root: { stack: { gap: 'sm' }, box: { paddingX: 'lg' }, palette: { variant: 'soft' } },
      },
    },
  },
  defaults: { variant: 'ghost' },
  api: {
    axes: ['variant'],
    themeScope: { accent: true },
    behaviour: {
      pressable: {
        target: 'root',
        popup: 'dialog',
        props: ['onPress', 'disabled', 'accessibilityLabel', 'accessibilityValue'],
      },
    },
    slots: {
      label: { part: 'label', kind: 'text', component: true, required: true },
      avatar: { part: 'avatar', kind: 'icon-name', component: true },
      value: { part: 'value', kind: 'text', component: true, required: true },
      chevron: { part: 'chevron', kind: 'icon-name', component: true, required: true },
    },
  },
};
