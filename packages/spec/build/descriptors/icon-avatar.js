/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-AVATAR · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of icon-avatar.ts — IDENTICAL data, emitted from the
 * SAME IR via the SAME canonical-order renderers, MINUS the TS apparatus
 * (no `import type`, no axes type, no `: Descriptor<…>` annotation). A
 * browser can `import { iconAvatarDescriptor }` from it at runtime with NO build
 * step — the runtime web factory (lib/runtime/factory.js · the decision-67
 * web factory) consumes it to render a de-collapsed nuri-* tree, preserving the
 * zero-build composition property (decision 66 · what Nuri IS #3).
 *
 * Sources (decision 65 · the composition model 65.3 · one source, two readers · decision 48):
 *   · mapping   — lib/components/icon-avatar/icon-avatar.css @layer (axis→namespace values)
 *   · structure — pages/components/icon-avatar.html data-part anatomy (decision 24.1)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edited — re-emit from the sources above.
 * ────────────────────────────────────────────────────────────── */

export const iconAvatarDescriptor = {
  structure: {
    anatomy: { el: 'view', parts: { icon: { el: 'icon' } } },
    base: {
      root: {
        stack: { align: 'center', justify: 'center' },
        box: { width: 'lg', height: 'lg', radius: 'full' },
      },
    },
  },
  variants: {
    variant: {
      solid: { root: { palette: { variant: 'solid' } } },
      soft: { root: { palette: { variant: 'soft' } } },
      ghost: { root: { palette: { variant: 'ghost' } } },
      subtle: { root: { palette: { variant: 'subtle' } } },
    },
  },
};
