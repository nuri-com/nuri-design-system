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

type ListActionAxes = {
  variant: 'outline' | 'solid' | 'soft' | 'ghost' | 'subtle';
};

export const listActionDescriptor: Descriptor<ListActionAxes> = {
  structure: {
    anatomy: {
      el: 'pressable',
      parts: {
        leadingAvatar: { el: 'view', parts: { leadingIcon: { el: 'icon' } } },
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
      leadingAvatar: {
        stack: { align: 'center', justify: 'center' },
        box: { width: 'lg', height: 'lg', radius: 'full' },
      },
      leadingIcon: { box: { width: 'xs', height: 'xs' } },
      content: {
        stack: { direction: 'column', align: 'start', justify: 'center', fill: 'grow' },
      },
      text: { typography: { size: 'md', emphasis: true, align: 'start' } },
      textMuted: { typography: { size: 'sm', align: 'start' }, palette: { muted: true } },
      trailing: {
        stack: { direction: 'column', align: 'end', justify: 'center' },
      },
      trailingText: { typography: { size: 'md', emphasis: true, align: 'end' } },
      trailingTextMuted: { typography: { size: 'sm', align: 'end' }, palette: { muted: true } },
      trailIcon: { box: { width: 'xs', height: 'xs' }, palette: { variant: 'subtle' } },
    },
  },
  variants: {
    // The row stays a ghost surface; variant is routed deliberately to the
    // leading avatar so grouped row surfaces can belong to a future list-group.
    variant: {
      outline: { leadingAvatar: { palette: { variant: 'outline' } } },
      solid: { leadingAvatar: { palette: { variant: 'solid' } } },
      soft: { leadingAvatar: { palette: { variant: 'soft' } } },
      ghost: { leadingAvatar: { palette: { variant: 'ghost' } } },
      subtle: { leadingAvatar: { palette: { variant: 'subtle' } } },
    },
  },
  defaults: { variant: 'outline' },
  api: {
    axes: ['variant'],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      leadingAvatar: { part: 'leadingIcon', kind: 'icon-name', component: true },
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
