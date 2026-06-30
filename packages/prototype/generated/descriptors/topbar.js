/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of build/descriptors/topbar.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { topbarDescriptor }`
 * from it at runtime with NO build step — the runtime web factory
 * (lib/runtime/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · pipeline/descriptors/topbar.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · pipeline/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edit build/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const topbarDescriptor = {
  structure: {
    // OPEN root (accepts the region sub-components / bare children) with three
    // region parts in row order. Authored in VISUAL row order (leading → center
    // → trailing): both factories walk the anatomy in key order, so this IS the
    // rendered order (the PART_ORDER re-sort matches it · parity-load-bearing).
    anatomy: {
      el: 'view',
      open: true,
      parts: {
        leading: { el: 'view' },
        center: { el: 'view' },
        trailing: { el: 'view' },
      },
    },
    base: {
      // The chrome row (height · edge padding · the canvas surface · today's values).
      root: {
        stack: { direction: 'row', align: 'center', gap: 'sm' },
        box: { height: 'xl', paddingStart: 'lg', paddingEnd: 'lg' },
        palette: { chrome: 'canvas' },
      },
      // The edges: equal-basis-0 flex (`even`) so they take an IDENTICAL share of
      // the leftover row → the centre is dead-centre. direction:row + align:center
      // lay the region's content horizontally, vertically centred; leading hugs the
      // start (default justify), trailing the end.
      leading: { stack: { direction: 'row', align: 'center', fill: 'even' } },
      // The centre is NATURAL (flex:none · sized to its content), centred within itself.
      center: { stack: { direction: 'row', align: 'center', justify: 'center' } },
      trailing: { stack: { direction: 'row', align: 'center', justify: 'end', fill: 'even' } },
    },
  },
};
