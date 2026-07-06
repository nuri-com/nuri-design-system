/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · LIST-ACTION · AUTHORED SOURCE
 *
 * The pressable row of the LIST FAMILY (`list` · `list-action` ·
 * `list-separator` — the home/settings screens' row vocabulary · decision 84;
 * `list-item` is RESERVED for the future non-pressable row). One pressable row
 * with typed composition slots for leading glyph avatar, content text, optional
 * trailing value stack, and a trailing glyph. Grouping, first/last corners, and
 * pressed bleed belong to a future list-group structure; separators are
 * author-placed `list-separator` siblings (decision 49 — never auto-inserted).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type ListActionAxes = {};

export const listActionDescriptor: Descriptor<ListActionAxes> = {
  structure: {
    anatomy: {
      el: 'pressable',
      parts: {
        leadingAvatar: {
          component: 'icon-avatar',
          props: {
            variant: '$slot.variant|outline',
            accent: '$slot.accent',
            icon: '$slot.name',
          },
        },
        content: { el: 'view', parts: { text: { el: 'text' }, textMuted: { el: 'text' } } },
        trailing: { el: 'view', parts: { trailingText: { el: 'text' }, trailingTextMuted: { el: 'text' } } },
        trailIcon: { el: 'icon' },
      },
    },
    base: {
      root: {
        stack: { direction: 'row', align: 'center', gap: 'md' },
        box: { padding: 'md', radius: 'lg' },
        palette: { variant: 'ghost' },
        interactive: { pressColor: true, disabledOpacity: true },
      },
      content: {
        stack: { direction: 'column', align: 'start', justify: 'center', fill: 'grow' },
      },
      text: { typography: { size: 'md', emphasis: true, align: 'start', flow: 'truncate', lines: 1 } },
      textMuted: { typography: { size: 'sm', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      trailing: {
        stack: { direction: 'column', align: 'end', justify: 'center' },
      },
      trailingText: { typography: { size: 'md', emphasis: true, align: 'end', flow: 'truncate', lines: 1 } },
      trailingTextMuted: { typography: { size: 'sm', align: 'end', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      trailIcon: { box: { width: 'xs', height: 'xs' }, palette: { variant: 'subtle' } },
    },
  },
  api: {
    axes: [],
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      leadingAvatar: { part: 'leadingAvatar', kind: 'icon-name', component: true },
      content: { part: 'content', kind: 'region' },
      text: { part: 'text', kind: 'text', component: true, multiple: true },
      textMuted: { part: 'textMuted', kind: 'text', component: true, multiple: true },
      trailing: { part: 'trailing', kind: 'region' },
      trailingText: { part: 'trailingText', kind: 'text', component: true, multiple: true },
      trailingTextMuted: { part: 'trailingTextMuted', kind: 'text', component: true, multiple: true },
      trailIcon: { part: 'trailIcon', kind: 'icon-name', component: true },
    },
  },
};
