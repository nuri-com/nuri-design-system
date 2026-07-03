/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · PRESSABLE-ITEM · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/pressable-item.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { pressableItemDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/pressable-item.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const pressableItemDescriptor = {
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
        palette: { variant: 'outline' },
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
  api: {
    axes: [],
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
