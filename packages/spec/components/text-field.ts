/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TEXT-FIELD · AUTHORED SOURCE
 *
 * Descriptor-backed one-line text field: a required label, an outlined field
 * box, the new contentless input control, and optional trailing controls that
 * delegate to the real Button / IconButton. Errors remain external composition via Alert.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type TextFieldAxes = {};

export const textFieldDescriptor: Descriptor<TextFieldAxes> = {
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
                size: 'md',
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
      button: { part: 'button', kind: 'children', component: true },
      iconButton: { part: 'iconButton', kind: 'icon-name', component: true },
    },
  },
};
