/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · LIST-ITEM · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/list-item.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { listItemDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/list-item.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const listItemDescriptor = {
  structure: {
    anatomy: {
      el: 'view',
      parts: {
        content: {
          el: 'view',
          parts: {
            textMuted: { el: 'text' },
            line: { el: 'view', parts: { text: { el: 'text' }, textSuffix: { el: 'text' } } },
          },
        },
      },
    },
    base: {
      // Sides ≡ list-action (md), so the text lines up with list-separator's
      // hairline. 60 tall (`xl`) with 6 above and below: list-separator's 6 + 6
      // make up the rest, so rows follow each other every 73 (#240 choice 5).
      root: {
        stack: { direction: 'row', align: 'center', gap: 'md' },
        box: { paddingX: 'md', paddingY: 'sm', minHeight: 'xl' },
      },
      // The lines stack in the order the author writes them; 3 between (choice 2).
      content: {
        stack: { direction: 'column', align: 'stretch', justify: 'center', gap: 'xs', fill: 'grow-shrink' },
      },
      // The label.
      textMuted: { typography: { size: 'sm', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      line: { stack: { direction: 'row', align: 'center', gap: 'xs' } },
      // The value: md emphasis, one line; it truncates first when the line is too long.
      text: {
        stack: { fill: 'shrink' },
        typography: { size: 'md', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      // Next to the value, 3 after it: "₿ 4 802 € 4.53". It never shrinks, on either target.
      textSuffix: {
        stack: { fill: 'hug' },
        typography: { size: 'md', align: 'start', flow: 'truncate', lines: 1 },
        palette: { muted: true },
      },
    },
  },
  api: {
    // No axis: the order is the author's. No behaviour: the row is not a control.
    axes: [],
    slots: {
      textMuted: { part: 'textMuted', kind: 'text', component: true },
      text: { part: 'text', kind: 'text', component: true, required: true },
      textSuffix: { part: 'textSuffix', kind: 'text', component: true },
    },
  },
};
