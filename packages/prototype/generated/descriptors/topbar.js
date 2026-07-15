/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/topbar.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { topbarDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/topbar.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
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
      // The chrome row (height · edge padding · a top inset · the canvas surface).
      root: {
        stack: { direction: 'row', align: 'center', gap: 'sm' },
        // 2xl bar · lg top inset · sm bottom rest — the 48px control row centres
        // EXACTLY (72 - 18 - 6 = 48), so content sits at container-inset + lg to the pixel.
        box: { height: '2xl', paddingStart: 'lg', paddingEnd: 'lg', paddingTop: 'lg', paddingBottom: 'sm' },
        palette: { chrome: 'canvas' },
      },
      // The edges: equal-basis-0 flex (`even`) so they take an IDENTICAL share of
      // the leftover row → the centre is dead-centre. direction:row + align:center
      // lay the region's content horizontally, vertically centred; leading hugs the
      // start (default justify), trailing the end.
      leading: { stack: { direction: 'row', align: 'center', fill: 'even' } },
      // The centre is NATURAL (flex:none · sized to its content), centred within itself.
      center: { stack: { direction: 'row', align: 'center', justify: 'center' } },
      trailing: { stack: { direction: 'row', align: 'center', justify: 'end', gap: 'sm', fill: 'even' } },
    },
  },
  variants: {
    surface: {
      canvas: { root: { palette: { chrome: 'canvas' } } },
      transparent: { root: { palette: { chrome: 'transparent' } } },
    },
  },
  defaults: { surface: 'canvas' },
  // The PUBLIC API (Path C · Phase 1). A static layout shell — one semantic
  // surface axis, NO behaviour. Three REGION slots map 1:1 to the typed sub-components
  // (`TopbarLeading/Center/Trailing` ↔ `nuri-topbar-<slot>`); bare children
  // default to `trailing` (the "just actions" case), so it carries `default:true`.
  api: {
    axes: ['surface'],
    themeScope: { accent: true },
    slots: {
      leading: { part: 'leading', kind: 'region' },
      center: { part: 'center', kind: 'region' },
      trailing: { part: 'trailing', kind: 'region', default: true },
    },
  },
};
