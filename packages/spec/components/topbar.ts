/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · AUTHORED SOURCE (hand-maintained)
 *
 * The slot-based ACTION BAR — the catalog's first COMPOUND component (the
 * container class). Three TYPED REGIONS in left→centre→right row order:
 *   · leading  — the start edge (a back affordance · a menu)
 *   · center   — the centre (a title · a segmented control)
 *   · trailing — the end edge (actions)
 * The factory generates the container PLUS one typed sub-component per region
 * (RN `TopbarLeading/Center/Trailing` ↔ web `<nuri-topbar-leading/center/
 * trailing>`); bare children of the container default to `trailing` (the
 * "just actions" case). DESCRIPTOR-DRIVEN — the compound capability is general
 * by construction (Card Header/Body, List Item will reuse it), exercised here
 * only by topbar.
 *
 * TRUE CENTERING is the forcing function (the centring forcing function): the
 * leading + trailing edges carry `stack:{fill:'even'}` (= flex 1 1 0 · the
 * equal-basis-0 split), the centre is `flex:none`. Two equal-share edges put
 * the centre at the bar's REAL centre regardless of edge-content asymmetry — a
 * small leading icon and a larger trailing icon-button leave the centre
 * dead-centre. `even`'s min-size 0 lets an over-wide edge truncate rather than
 * shove the centre. This is what the old stringly `center` boolean axis (a
 * pivot patch) could not do — so that axis is GONE; the only public axis is the
 * semantic bar surface (default canvas · transparent for overlay/product screens).
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base }, composed
 * from the five primitive namespaces (65.3 §6) in SEMANTIC names; the engine
 * resolves them (factory on RN · CSS on web · 65.1). The COMPOUND generation +
 * the default-slot routing are the factory's behaviour, never data (decision 65).
 *
 * FROZEN shape (decision 65 step 5 · Guard F); the regions use the `leading`/
 * `center`/`trailing` Part vocab + the `even` StackNS.fill, both added at this
 * slice (the 2nd post-freeze contract bump · the Guard-F pins move with them).
 *
 * The only variant axis is the semantic surface. True centring remains structural,
 * not a `center` boolean. (It must immediately follow the import + stay brace-form
 * so the browser-ESM twin's type-strip removes it · emitDescriptorJsFromSource.)
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type TopbarAxes = { surface: 'canvas' | 'transparent' };

export const topbarDescriptor: Descriptor<TopbarAxes> = {
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
        box: { height: 'xl', paddingStart: 'lg', paddingEnd: 'lg', paddingTop: 'sm' },
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
