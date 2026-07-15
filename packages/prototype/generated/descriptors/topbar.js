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
    // OPEN root (accepts the region sub-components / bare children) with four
    // region parts in row order. Authored in VISUAL row order (leading → center
    // → content → trailing): both factories walk the anatomy in key order, so this IS the
    // rendered order.
    anatomy: {
      el: 'view',
      open: true,
      parts: {
        leading: { el: 'view' },
        center: { el: 'view' },
        content: {
          el: 'view',
          parts: {
            title: { el: 'text' },
          },
        },
        trailing: { el: 'view' },
      },
    },
    base: {
      // The chrome row (height · edge padding · a top inset · the canvas surface).
      root: {
        stack: { direction: 'row', align: 'center' },
        // 2xl bar · lg top inset · sm bottom rest — the 48px control row centres
        // EXACTLY (72 - 18 - 6 = 48), so content sits at container-inset + lg to the pixel.
        box: { height: '2xl', paddingStart: 'lg', paddingEnd: 'lg', paddingTop: 'lg', paddingBottom: 'sm' },
        palette: { chrome: 'canvas' },
      },
      // The edges: equal-basis-0 flex (`even`) so they take an IDENTICAL share of
      // the leftover row → the centre is dead-centre. direction:row + align:center
      // lay the region's content horizontally, vertically centred; leading hugs the
      // start (default justify), trailing the end.
      // Spacing lives on the edge regions instead of root `gap`: the always-present
      // inactive centre/content lane stays zero-width in the opposite layout and
      // therefore cannot manufacture an extra gap.
      leading: {
        stack: { direction: 'row', align: 'center' },
        box: { paddingEnd: 'sm' },
      },
      // The centre is NATURAL (flex:none · sized to its content), centred within itself.
      center: { stack: { direction: 'row', align: 'center', justify: 'center' } },
      // Column + stretch makes an arbitrary fluid child (notably TextField) take
      // the width selected by the content lane. The nested title shares that width.
      content: { stack: { direction: 'column', align: 'stretch' } },
      title: {
        typography: { size: 'lg', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      trailing: {
        stack: { direction: 'row', align: 'center', justify: 'end', gap: 'sm' },
        box: { paddingStart: 'sm' },
      },
    },
  },
  variants: {
    surface: {
      canvas: { root: { palette: { chrome: 'canvas' } } },
      transparent: { root: { palette: { chrome: 'transparent' } } },
    },
    layout: {
      centered: {
        leading: { stack: { fill: 'even' } },
        trailing: { stack: { fill: 'even' } },
      },
      fluid: {
        leading: { stack: { fill: 'hug' } },
        content: { stack: { fill: 'grow-shrink' } },
        trailing: { stack: { fill: 'hug' } },
      },
    },
  },
  defaults: { surface: 'canvas', layout: 'centered' },
  // The PUBLIC API (Path C · Phase 1). A static layout shell — semantic surface
  // and layout axes, NO behaviour. Four REGION slots map 1:1 to typed sub-components;
  // the nested title is a generated text component with the preset above. Bare children
  // default to `trailing` (the "just actions" case), so it carries `default:true`.
  api: {
    axes: ['surface', 'layout'],
    themeScope: { accent: true },
    slots: {
      leading: { part: 'leading', kind: 'region' },
      center: { part: 'center', kind: 'region' },
      content: { part: 'content', kind: 'region' },
      title: { part: 'title', kind: 'text', component: true },
      trailing: { part: 'trailing', kind: 'region', default: true },
    },
  },
};
