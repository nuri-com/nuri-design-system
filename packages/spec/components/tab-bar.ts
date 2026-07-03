/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TAB-BAR · AUTHORED SOURCE (hand-maintained)
 *
 * The bottom navigation BAR — a DUMB layout container. It lays out its `TabBarItem`
 * children as EQUAL COLUMNS and nothing else: NO `value`, NO state,
 * NO derivation. The consumer assembles the real tab-bar (holds `active`, passes
 * `selected={active === value}` + `onPress` down to each item); the bar never sees
 * `active`/`value`. A controller would be business logic in the DS (rejected · the
 * DS/business-logic boundary is the whole point of this slice).
 *
 * OPEN, not COMPOUND (the distinction · descriptor-driven): the bar is an `open:
 * true` root with NO named regions — it renders its POSITIONAL children (the Tab
 * items) directly in the row. This is the open-primitive layer (§7), distinct from
 * the topbar's COMPOUND capability (named leading/center/trailing slots + a typed
 * sub-component each). A TabBarItem is a REPEATED item, not a named slot, so it is a
 * separate, STANDALONE component (its own public name `tab-bar-item` · web
 * `nuri-tab-bar-item`), NOT a compound region. The factory's open-positional-children
 * render (the one capability this slice adds · descriptor-driven, reusable by
 * List/Tabs) places the children inside this root.
 *
 * EQUAL COLUMNS come from the CHILDREN, not the bar: each Tab's root carries
 * `stack:{fill:'even'}` (flex 1 1 0 · the topbar-slots value), so N items in this
 * `direction:'row'` bar take an IDENTICAL share — N equal columns, for free. The
 * bar itself is just the chrome: the `size.xl` height (the bottom-destination
 * row · a comfortable touch target) + `align:'stretch'` so each item fills the
 * full bar height (the whole column is tappable), over the `surface` axis'
 * bottom-bar chrome (default canvas · transparent for docked-over-content screens).
 * Decision 49 still holds: no top border — dividers are author-placed.
 *
 * NO routing / safe-area / position:fixed (the consuming app's · the legacy
 * decision · the primitive is presentation only). PURE DATA (no theme thunk ·
 * 65.3 §7): structure { anatomy, base } in SEMANTIC names; the engine resolves
 * them (factory on RN · CSS on web · 65.1). The only public axis is the semantic
 * bar surface; it must immediately follow the import + stay brace-form so the
 * browser-ESM twin's type-strip removes it · the topbar precedent ·
 * emitDescriptorJsFromSource.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type TabBarAxes = { surface: 'canvas' | 'transparent' };

export const tabBarDescriptor: Descriptor<TabBarAxes> = {
  structure: {
    // OPEN root (accepts the Tab children as positional content · §7) with NO named
    // parts — the factory renders an open container's positional children directly.
    anatomy: {
      el: 'view',
      open: true,
    },
    base: {
      // The chrome row: a full-height stretch row (each item fills the bar height ·
      // the column is tappable), over the canvas surface. The item children carry
      // the `even` flex that equalizes the columns. `minHeight:'xl'` is the
      // bottom-bar chrome FLOOR (the legacy 54 row · a min, not a hard cap, so the
      // bar GROWS rather than compressing its items); `paddingBottom` lifts the
      // icon-over-label content off the screen's bottom edge so the labels keep air
      // from the gesture/home-indicator zone. The DYNAMIC per-device safe-area inset
      // is STILL the consuming app's (added on top · the brief's boundary) — this is
      // the bar's intrinsic bottom breathing room, not the device inset.
      root: {
        stack: { direction: 'row', align: 'stretch' },
        box: { minHeight: 'xl', paddingBottom: 'md' },
        palette: { chrome: 'canvas' },
      },
    },
  },
  variants: {
    surface: {
      canvas: { root: { palette: { chrome: 'canvas' } } },
      transparent: { root: { palette: { chrome: 'transparent' } } },
    },
  },
  defaults: { surface: 'canvas' },
  // The PUBLIC API (Path C · Phase 1). A DUMB open container — one semantic
  // surface axis, NO behaviour. ONE slot: its repeated `TabBarItem` children render as the
  // open root's positional content (`kind: 'children'` · `multiple: true`), so
  // `default: true` on the `root` container part.
  api: {
    axes: ['surface'],
    themeScope: { accent: true },
    slots: {
      default: { part: 'root', kind: 'children', default: true, multiple: true },
    },
  },
};
