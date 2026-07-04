/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TEXT-FIELD · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/text-field.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { textFieldDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/text-field.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const textFieldDescriptor = {
  structure: {
    anatomy: {
      el: 'view',
      parts: {
        label: { el: 'text' },
        box: {
          el: 'view',
          parts: {
            input: { el: 'input' },
            action: {
              component: 'button',
              props: {
                variant: 'soft',
                size: 'sm',
                children: '$slot.children',
                onPress: '$slot.onPress',
                disabled: '$slot.disabled',
                accessibilityLabel: '$slot.accessibilityLabel',
              },
            },
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
        box: { height: 'xl', paddingX: 'md', radius: 'md' },
        palette: { variant: 'outline' },
      },
      input: {
        stack: { fill: 'grow-shrink' },
        typography: { size: 'md', align: 'start' },
        palette: { chrome: 'transparent' },
      },
    },
  },
  api: {
    axes: [],
    themeScope: { accent: true },
    behaviour: {
      input: {
        target: 'input',
        focusTarget: 'box',
        labelPart: 'label',
        props: [
          'value',
          'onChangeText',
          'placeholder',
          'inputMode',
          'secureTextEntry',
          'disabled',
          'onFocus',
          'onBlur',
          'accessibilityLabel',
        ],
      },
    },
    slots: {
      label: { part: 'label', kind: 'text', component: true, required: true },
      action: { part: 'action', kind: 'children', component: true },
    },
  },
};
