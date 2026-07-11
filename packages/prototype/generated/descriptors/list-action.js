/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · LIST-ACTION · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/list-action.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { listActionDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/list-action.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const listActionDescriptor = {
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
        stack: { direction: 'column', align: 'stretch', justify: 'center', fill: 'grow-shrink' },
      },
      text: { typography: { size: 'md', emphasis: true, align: 'start', flow: 'truncate', lines: 1 } },
      textMuted: { typography: { size: 'sm', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      trailing: {
        stack: { direction: 'column', align: 'end', justify: 'center' },
      },
      trailingText: { typography: { size: 'md', emphasis: true, align: 'end', flow: 'truncate', lines: 1 } },
      trailingTextMuted: { typography: { size: 'sm', align: 'end', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      trailIcon: { box: { width: 'sm', height: 'sm' }, palette: { variant: 'subtle' } },
    },
  },
  api: {
    axes: [],
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      leadingAvatar: { part: 'leadingAvatar', kind: 'icon-name', component: true },
      text: { part: 'text', kind: 'text', component: true, multiple: true },
      textMuted: { part: 'textMuted', kind: 'text', component: true, multiple: true },
      trailingText: { part: 'trailingText', kind: 'text', component: true, multiple: true },
      trailingTextMuted: { part: 'trailingTextMuted', kind: 'text', component: true, multiple: true },
      trailIcon: { part: 'trailIcon', kind: 'icon-name', component: true },
    },
  },
};
