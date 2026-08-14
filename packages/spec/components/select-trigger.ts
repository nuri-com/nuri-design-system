/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · SELECT-TRIGGER · AUTHORED SOURCE
 *
 * The cluster-sized disclosure control used inline with content. Unlike
 * SelectField, every visible part lives inside one coupled press target. The
 * component owns presentation and disclosure semantics only; consumers own the
 * dialog, open state, and selection state.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type SelectTriggerAxes = {
  variant: 'ghost' | 'pill';
};

export const selectTriggerDescriptor: Descriptor<SelectTriggerAxes> = {
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
        stack: { direction: 'row', align: 'center' },
        box: { minHeight: 'lg', radius: 'full' },
        interactive: { pressColor: true, disabledOpacity: true },
      },
      label: {
        typography: { size: 'sm', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      value: {
        stack: { fill: 'grow-shrink' },
        typography: { size: 'sm', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      chevron: {
        box: { width: 'sm', height: 'sm' },
        palette: { variant: 'subtle' },
      },
    },
  },
  variants: {
    variant: {
      ghost: {
        root: { stack: { gap: 'xs' }, palette: { variant: 'ghost' } },
      },
      pill: {
        root: { stack: { gap: 'sm' }, box: { paddingX: 'lg' }, palette: { chrome: 'subtle' } },
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
