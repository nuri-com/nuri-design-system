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
  variant: 'ghost' | 'subtle';
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
        // gap unified across variants + 36px min-height (operator 2026-08-15;
        // supersedes the 48px of the admission record).
        stack: { direction: 'row', align: 'center', gap: 'sm', fill: 'hug' },
        box: { minHeight: 'md', radius: 'full' },
        // Scale + disabled are shared; the wash is subtle-only (operator
        // 2026-08-14): ghost presses read through pure scale.
        interactive: { pressScale: true, disabledOpacity: true },
      },
      label: {
        typography: { size: 'sm', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      value: {
        // shrink, never grow: grow is useless inside the hugged cluster and
        // Android inflates flexGrow Text to the full available width.
        stack: { fill: 'shrink' },
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
        root: { palette: { variant: 'ghost' } },
      },
      subtle: {
        root: {
          box: { paddingX: 'lg' },
          palette: { variant: 'soft' },
          interactive: { pressColor: true },
        },
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
