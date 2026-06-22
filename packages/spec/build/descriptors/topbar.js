/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of topbar.ts — IDENTICAL data, emitted from the
 * SAME IR via the SAME canonical-order renderers, MINUS the TS apparatus
 * (no `import type`, no axes type, no `: Descriptor<…>` annotation). A
 * browser can `import { topbarDescriptor }` from it at runtime with NO build
 * step — the runtime web factory (lib/runtime/factory.js · the decision-67
 * web factory) consumes it to render a de-collapsed nuri-* tree, preserving the
 * zero-build composition property (decision 66 · what Nuri IS #3).
 *
 * Sources (decision 65 · the composition model 65.3 · one source, two readers · decision 48):
 *   · mapping   — lib/components/topbar/topbar.css @layer (axis→namespace values)
 *   · structure — pages/components/topbar.html data-part anatomy (decision 24.1)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edited — re-emit from the sources above.
 * ────────────────────────────────────────────────────────────── */

export const topbarDescriptor = {
  structure: {
    anatomy: { el: 'view', open: true, parts: { content: { el: 'view' } } },
    base: {
      root: {
        stack: { direction: 'row', align: 'center', gap: 'sm' },
        box: { height: 'lg', paddingStart: 'lg', paddingEnd: 'lg' },
        palette: { chrome: 'canvas' },
      },
      content: {
        stack: { fill: 'grow-shrink' },
      },
    },
  },
  variants: {
    center: {
      false: {},
      true: { content: { stack: { align: 'center', justify: 'center' } } },
    },
  },
};
