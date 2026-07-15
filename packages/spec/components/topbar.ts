/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · AUTHORED SOURCE (hand-maintained)
 *
 * The slot-based ACTION BAR — the catalog's first COMPOUND component (the
 * container class). Four TYPED REGIONS in left→centre/content→right row order:
 *   · leading  — the start edge (a back affordance · a menu)
 *   · center   — the centre (a title · a segmented control)
 *   · content  — the fluid lane (a one-line title · a search field)
 *   · trailing — the end edge (actions)
 * The factory generates the container PLUS one typed sub-component per region
 * (RN `TopbarLeading/Center/Content/Trailing` ↔ web `<nuri-topbar-leading/center/
 * content/trailing>`) and the nested `TopbarTitle` text slot; bare children of the container default to `trailing` (the
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
 * pivot patch) could not do — so that boolean axis remains gone. The explicit
 * `layout` axis chooses between this centred structure and the fluid lane.
 * `surface` independently selects canvas or transparent chrome.
 * `layout:'fluid'` is the complementary row: leading/trailing hug their content
 * and the content lane grows + shrinks through the remaining width. The title is
 * a nested, preset text part (`lg` emphasis · start aligned · one-line truncate),
 * so authored titles cannot accidentally turn the fixed-height bar multiline.
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base }, composed
 * from the five primitive namespaces (65.3 §6) in SEMANTIC names; the engine
 * resolves them (factory on RN · CSS on web · 65.1). The COMPOUND generation +
 * the default-slot routing are the factory's behaviour, never data (decision 65).
 *
 * FROZEN descriptor shape (decision 65 step 5 · Guard F); this addition uses only
 * existing axes, region/text slots, and namespace fields. It changes Topbar's
 * component contract without changing the frozen schema.
 *
 * True centring remains structural, not a `center` boolean. (The axes type must
 * immediately follow the import + stay brace-form
 * so the browser-ESM twin's type-strip removes it · emitDescriptorJsFromSource.)
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type TopbarAxes = {
  surface: 'canvas' | 'transparent';
  layout: 'centered' | 'fluid';
};

export const topbarDescriptor: Descriptor<TopbarAxes> = {
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
