/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TAB-BAR-ITEM · AUTHORED SOURCE (hand-maintained)
 *
 * The bottom-bar ITEM (TabBarItem · web nuri-tab-bar-item) — icon-over-label,
 * presentation only. The DS
 * is DUMB: it renders an item that LOOKS selected or not and fires `onPress`; it
 * knows nothing about which destination is active (no `value`, no state, no
 * derivation · the consumer owns that). The CONSUMER computes `selected={active
 * === value}` and what a tap does (`onPress={() => setActive(value)}`).
 *
 * ANATOMY — two leaf parts in COLUMN row order: `icon` (the glyph · `el:'icon'`)
 * OVER `label` (the destination name · `el:'text'`). Authored icon-first so both
 * factories render the glyph above the label (the browser twin is a verbatim
 * passthrough of this key order · the open-positional / icon-arc precedent · NOT
 * PART_ORDER-resorted, which only governs the retired CSS oracle). The root is a
 * `column` stack centred on both axes with the small `xs` gap; `fill:'even'`
 * (flex 1 1 0 + min-size 0 · the topbar-slots value) makes each item take an
 * IDENTICAL share of the bar row, so N items → N equal columns for free.
 *
 * SELECTED / UNSELECTED — a COLOUR treatment only (icon weights were dropped at
 * decision 38 / N+51, so selection is NOT a `fill` weight). Encoded as the 2-value
 * `state` appearance axis over the EXISTING palette variants — `ghost` when
 * selected (transparent bg · `text-primary` fg) vs `subtle` when unselected
 * (transparent bg · the receded `border-strong` fg). The icon + label INHERIT the
 * root's fg by scope (§12 · F-BOX-FG-1), so the one variant patch recolours both.
 *
 * THE BOOLEAN BRIDGE (the encoding decision · flagged): the consumer API is a
 * clean `selected: boolean` (`selected={active === value}`) — NOT a stringly axis
 * prop. Both factories bridge that boolean onto this `state` axis (true→'selected'
 * · false→'unselected'), so the stringly axis values never reach the call site (no
 * stringly-boolean wart · the topbar `center`-axis lesson). This 2-value-axis
 * encoding was chosen over the `palette.muted` flag deliberately: `muted` has NO
 * web rendering (the generated palette.css carries no `[data-muted]` rule, and
 * adding one would break the palette-css order-soundness guard) — `ghost`/`subtle`
 * render on BOTH targets via the existing CSS, give exact web↔RN parity, and match
 * the legacy tab-bar's resting colours (selected `text-primary` · unselected
 * `border-strong`) precisely.
 *
 * INTERACTIVE — `pressScale` ONLY (the legacy tab-item baseline · decision 45): a
 * tap scales the item, with NO background change and NO `pressColor`. `onPress` is
 * the factory's passthrough; an unselected item stays fully tappable (that is how
 * you switch destinations · the DS never blocks it).
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base } + variants in
 * SEMANTIC names; the platform-native engine resolves them (factory on RN · CSS on
 * web · 65.1). No routing / safe-area / position:fixed — those belong to the
 * consuming app (the legacy decision · the primitive is presentation only).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type TabBarItemAxes = {
  state: 'selected' | 'unselected';
};

export const tabBarItemDescriptor: Descriptor<TabBarItemAxes> = {
  structure: {
    anatomy: {
      el: 'pressable',
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
      label: { box: { paddingEnd: 'sm' }, typography: { size: 'xs', emphasis: true, flow: 'truncate', lines: 1 } },
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
  // computes `selected`). Both projections read this (the RN component-API
  // codegen's default bake · the web buildComponent fallback) — neither hand-knows a default.
  defaults: { state: 'unselected' },
  // The PUBLIC API (Path C · Phase 1). NO public style axes — the `state` axis is
  // NOT surfaced raw; it is the target of the `selected`→state bridge as DATA
  // (`propMaps.selected` · true→'selected' · false→'unselected'), which retires
  // the `'state' extends keyof A` factory magic. The root is pressable (onPress +
  // a11y label · NO `disabled` — an unselected item stays tappable, the DS never
  // blocks it · matching the pressScale-only `interactive` opt-in). TWO generated
  // component slots (icon-over-label · NOT scalar `icon`/`label` props) keep this
  // multipart lockup aligned with Button's composed API.
  api: {
    axes: [],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', role: 'tab', props: ['onPress', 'accessibilityLabel'] } },
    propMaps: { selected: { axis: 'state', true: 'selected', false: 'unselected' } },
    slots: {
      icon: { part: 'icon', kind: 'icon-name', component: true },
      label: { part: 'label', kind: 'text', component: true },
    },
  },
};
