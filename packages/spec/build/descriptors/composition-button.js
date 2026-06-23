/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · COMPOSITION-BUTTON · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of build/descriptors/composition-button.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { compositionButtonDescriptor }`
 * from it at runtime with NO build step — the runtime web factory
 * (lib/runtime/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · pipeline/descriptors/composition-button.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · pipeline/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edit build/ — edit the authored source above.
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
