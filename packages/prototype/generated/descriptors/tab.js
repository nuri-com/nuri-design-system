/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TAB · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of build/descriptors/tab.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { tabDescriptor }`
 * from it at runtime with NO build step — the runtime web factory
 * (lib/runtime/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · pipeline/descriptors/tab.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · pipeline/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edit build/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const tabDescriptor = {
  structure: {
    anatomy: {
      el: 'view',
      // Authored in COLUMN order (icon → label · glyph above the destination
      // name): both factories walk the anatomy in key order, so this IS the
      // rendered top→bottom order on RN and web (the twin is a verbatim
      // passthrough · parity-load-bearing).
      parts: {
        icon: { el: 'icon' },
        label: { el: 'text' },
      },
    },
    base: {
      // The equal column: a centred column stack with `even` flex (1 1 0 · min-size
      // 0) so N items split the bar row identically. pressScale-only interaction
      // (no bg change · decision 45 · the legacy tab-item baseline).
      root: {
        stack: { direction: 'column', align: 'center', justify: 'center', gap: 'xs', fill: 'even' },
        interactive: { pressScale: true },
      },
      // The glyph rides the SHARED box axis (the icon-arc · N+51) — a 24px (`sm`
      // leaf) destination glyph; its colour is the root fg by scope (§12).
      icon: { box: { width: 'sm', height: 'sm' } },
      // The destination label · the smallest type step, EMPHASISED (the uniform
      // semibold · decision 77) under the glyph — a compact, legible tab caption.
      label: { typography: { size: 'xs', emphasis: true } },
    },
  },
  variants: {
    // The COLOUR-only selection treatment (icon weights dropped · decision 38). The
    // consumer's `selected` boolean bridges onto this axis in both factories.
    state: {
      selected: { root: { palette: { variant: 'ghost' } } },
      unselected: { root: { palette: { variant: 'subtle' } } },
    },
  },
  // An unconfigured item reads as INACTIVE (the safe default · the consumer always
  // computes `selected`). Both factories read this (createNuriComponent's
  // defaultByAxis · the web buildComponent fallback) — neither hand-knows a default.
  defaults: { state: 'unselected' },
};
