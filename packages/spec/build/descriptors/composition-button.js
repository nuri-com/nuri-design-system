/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · COMPOSITION-BUTTON · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of composition-button.ts — IDENTICAL data, emitted from the
 * SAME IR via the SAME canonical-order renderers, MINUS the TS apparatus
 * (no `import type`, no axes type, no `: Descriptor<…>` annotation). A
 * browser can `import { compositionButtonDescriptor }` from it at runtime with NO build
 * step — the runtime web factory (lib/runtime/factory.js · the decision-67
 * S3 mirror) consumes it to render a de-collapsed nuri-* tree, preserving the
 * zero-build composition property (decision 66 · what Nuri IS #3).
 *
 * Sources (decision 65 · the composition model 65.3 · one source, two readers · decision 48):
 *   · mapping   — lib/components/button/button.css @layer (axis→namespace values)
 *   · structure — pages/components/button.html data-part anatomy (decision 24.1)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edited — re-emit from the sources above.
 * ────────────────────────────────────────────────────────────── */

export const compositionButtonDescriptor = {
  structure: {
    anatomy: { el: 'view', parts: { label: { el: 'text' } } },
    base: {
      root: {
        stack: { direction: 'row', align: 'center', justify: 'center' },
        interactive: { pressColor: true, pressScale: true, disabledOpacity: true },
      },
    },
  },
  variants: {
    variant: {
      solid: { root: { palette: { variant: 'solid' } } },
      soft: { root: { palette: { variant: 'soft' } } },
      ghost: { root: { palette: { variant: 'ghost' } } },
    },
    size: {
      sm: { root: { box: { minHeight: 'md', paddingX: 'md', radius: 'sm' } }, label: { typography: { size: 'smEm' } } },
      md: { root: { box: { minHeight: 'lg', paddingX: 'lg', radius: 'sm' } }, label: { typography: { size: 'mdEm' } } },
      lg: { root: { box: { minHeight: 'xl', paddingX: 'xl', radius: 'md' } }, label: { typography: { size: 'mdEm' } } },
    },
  },
};
