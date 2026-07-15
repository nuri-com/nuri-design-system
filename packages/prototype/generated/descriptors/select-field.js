/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · SELECT-FIELD · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/select-field.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { selectFieldDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/select-field.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const selectFieldDescriptor = {
  structure: {
    anatomy: {
      el: 'view',
      parts: {
        label: { el: 'text' },
        box: {
          el: 'pressable',
          parts: {
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
      },
    },
    base: {
      root: {
        stack: { direction: 'column', align: 'stretch', gap: 'md' },
      },
      label: {
        typography: { size: 'sm', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
        palette: { muted: true },
      },
      box: {
        stack: { direction: 'row', align: 'center', gap: 'sm' },
        box: { height: 'xl', paddingStart: 'md', paddingEnd: 'md', radius: 'md' },
        palette: { variant: 'outline' },
        interactive: { pressColor: true, disabledOpacity: true },
      },
      value: {
        stack: { fill: 'grow-shrink' },
        typography: { size: 'md', align: 'start', flow: 'truncate', lines: 1 },
      },
      chevron: {
        box: { width: 'sm', height: 'sm' },
        palette: { variant: 'subtle' },
      },
    },
  },
  variants: {
    size: {
      md: { box: { box: { height: 'lg' } } },
      lg: {},
    },
  },
  defaults: { size: 'lg' },
  api: {
    axes: ['size'],
    themeScope: { accent: true },
    behaviour: {
      pressable: {
        target: 'box',
        popup: 'dialog',
        props: ['onPress', 'disabled', 'accessibilityLabel', 'accessibilityValue'],
      },
    },
    slots: {
      label: { part: 'label', kind: 'text', component: true, required: true },
      avatar: { part: 'avatar', kind: 'icon-name', component: true },
      value: { part: 'value', kind: 'text', component: true, required: true },
      chevron: { part: 'chevron', kind: 'icon-name', component: true },
    },
  },
};
