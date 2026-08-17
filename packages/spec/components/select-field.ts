/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · SELECT-FIELD · AUTHORED SOURCE
 *
 * A disclosure button dressed as a field. It presents a picker dialog; it is
 * never an input and therefore owns no caret, keyboard, or editing behaviour.
 * The visible value remains consumer-authored composition while the dynamic
 * accessibility value travels through the pressable behaviour channel.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type SelectFieldAxes = {
  size: 'md' | 'lg';
};

export const selectFieldDescriptor: Descriptor<SelectFieldAxes> = {
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
        // 18px caret matching the trigger's glyph size (operator 2026-08-15);
        // the SUBTLE palette stays — the field keeps its receded chevron
        // colour, deliberately NOT the trigger's text-coloured caret.
        box: { width: 'xs', height: 'xs' },
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
