/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · MODAL-PANEL · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/modal-panel.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { modalPanelDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/modal-panel.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const modalPanelDescriptor = {
  structure: {
    anatomy: {
      el: 'view',
      open: true,
    },
    base: {
      root: {
        stack: { direction: 'column', align: 'stretch' },
        palette: { chrome: 'canvas' },
      },
    },
  },
  variants: {
    mode: {
      sheet: {
        root: {
          box: { radiusTop: 'lg' },
          effect: { elevation: 'raised' },
        },
      },
      full: {
        root: {
          stack: { fill: 'grow-shrink' },
        },
      },
    },
  },
  defaults: { mode: 'sheet' },
  api: {
    axes: ['mode'],
    themeScope: { accent: true },
    slots: {
      default: { part: 'root', kind: 'children', default: true, multiple: true },
    },
  },
};
