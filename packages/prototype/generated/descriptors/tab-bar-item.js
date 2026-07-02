/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TAB-BAR-ITEM · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/tab-bar-item.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { tabBarItemDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/tab-bar-item.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const tabBarItemDescriptor = {
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
      label: { box: { paddingEnd: 'sm' }, typography: { size: 'xs', emphasis: true } },
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
  // blocks it · matching the pressScale-only `interactive` opt-in). TWO composed
  // slots (icon-over-label · NOT scalar `prop` shorthands — this icon is a lockup
  // member, not a single-glyph control).
  api: {
    axes: [],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', props: ['onPress', 'accessibilityLabel'] } },
    propMaps: { selected: { axis: 'state', true: 'selected', false: 'unselected' } },
    slots: {
      icon: { part: 'icon', kind: 'icon-name' },
      label: { part: 'label', kind: 'text' },
    },
  },
};
