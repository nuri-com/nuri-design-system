/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-BUTTON · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of build/descriptors/icon-button.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { iconButtonDescriptor }`
 * from it at runtime with NO build step — the runtime web factory
 * (lib/runtime/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · pipeline/descriptors/icon-button.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · pipeline/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edit build/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const iconButtonDescriptor = {
  structure: {
    anatomy: {
      el: 'view',
      // Authored in VISUAL row order (prefix → icon → suffix · left → centre →
      // right): both factories walk the anatomy in key order, so this IS the
      // rendered order on RN and web (the twin is a verbatim passthrough · the
      // PART_ORDER re-sort matches this same order · parity-load-bearing).
      parts: {
        prefix: { el: 'text' },
        icon: { el: 'icon' },
        suffix: { el: 'text' },
      },
    },
    base: {
      root: {
        // The anchored row: the icon centres, the optional flanks sit beside it
        // with a gap (only between RENDERED items — a bare control has one item,
        // so the gap never widens the circle).
        stack: { direction: 'row', align: 'center', justify: 'center', gap: 'sm' },
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
    // SIZE · minHeight + radius stay coherent with button; minWidth =
    // minHeight floors the bare control to a SQUARE (the root paddingX is the icon
    // edge ring — sm 6 · md/lg 12 — absorbed by the border-box floor, so the bare
    // form stays square while the icon-at-an-edge in the single-flank forms gets a
    // comfortable gap). The flank paddingStart/End add the FLANKED text's own edge
    // breathing-room on top. The icon `box` sizes the glyph; prefix/suffix
    // typography mirrors the button label.
    size: {
      sm: {
        root: { box: { minHeight: 'md', minWidth: 'md', paddingX: 'sm', radius: 'full' } },
        prefix: { box: { paddingStart: 'sm' }, typography: { size: 'sm', emphasis: true } },
        icon: { box: { width: 'xs', height: 'xs' } },
        suffix: { box: { paddingEnd: 'sm' }, typography: { size: 'sm', emphasis: true } },
      },
      md: {
        root: { box: { minHeight: 'lg', minWidth: 'lg', paddingX: 'md', radius: 'full' } },
        prefix: { box: { paddingStart: 'md' }, typography: { size: 'md', emphasis: true } },
        icon: { box: { width: 'sm', height: 'sm' } },
        suffix: { box: { paddingEnd: 'md' }, typography: { size: 'md', emphasis: true } },
      },
      lg: {
        root: { box: { minHeight: 'xl', minWidth: 'xl', paddingX: 'md', radius: 'full' } },
        prefix: { box: { paddingStart: 'lg' }, typography: { size: 'md', emphasis: true } },
        icon: { box: { width: 'sm', height: 'sm' } },
        suffix: { box: { paddingEnd: 'lg' }, typography: { size: 'md', emphasis: true } },
      },
    },
  },
  // The PUBLIC defaults (R1.5 · N+50) — soft + md, mirroring the legacy
  // icon-button's soft default. Both factories read this; neither binding
  // hand-passes a default.
  defaults: { variant: 'soft', size: 'md' },
};
