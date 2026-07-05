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
            button: {
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
            iconButton: {
              component: 'icon-button',
              props: {
                variant: 'ghost',
                icon: '$slot.name',
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
        // No gap between the input and the trailing action (zero is expressed by
        // OMITTING gap — SpaceLeaf has no 0/none token; flex default gap = 0).
        stack: { direction: 'row', align: 'center' },
        // Asymmetric horizontal padding: md leading (text edge) · sm trailing (a
        // tighter edge for the trailing action's own ring).
        box: { height: 'xl', paddingStart: 'md', paddingEnd: 'sm', radius: 'md' },
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
      button: { part: 'button', kind: 'children', component: true },
      iconButton: { part: 'iconButton', kind: 'icon-name', component: true },
    },
  },
};
