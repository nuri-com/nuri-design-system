/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-AVATAR · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/icon-avatar.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { iconAvatarDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/icon-avatar.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const iconAvatarDescriptor = {
  structure: {
    anatomy: { el: 'view', parts: { icon: { el: 'icon' } } },
    base: {
      root: {
        stack: { align: 'center', justify: 'center' },
        box: { width: 'lg', height: 'lg', radius: 'full' },
      },
      // The glyph sizes through the SHARED box axis (N+51 · the icon-arc size
      // close): the icon part is a box of the `sm` size leaf (24px) — the icon's
      // "md". The factory applies it on BOTH targets (web: nuri-box + data-width/
      // data-height on the <nuri-icon>; RN: the resolved width → the glyph's
      // dimension). NAMING OFFSET: the icon's public size `md` ↔ the `sm` size
      // leaf (icon `sm` ↔ size `xs`) — anchors below element heights by design.
      icon: { box: { width: 'sm', height: 'sm' } },
    },
  },
  variants: {
    variant: {
      solid: { root: { palette: { variant: 'solid' } } },
      soft: { root: { palette: { variant: 'soft' } } },
      ghost: { root: { palette: { variant: 'ghost' } } },
      subtle: { root: { palette: { variant: 'subtle' } } },
    },
  },
  // The PUBLIC default (R1.5 · N+50): an unset `variant` resolves to soft (NOT
  // the variant-order first value `solid`) — the web factory reads it, no hand
  // default at the binding. DECORATIVE (decision 50): the host is hidden from
  // AT (aria-hidden) — honest descriptor data the web factory reads, not a hand
  // `aria-hidden` in the registration.
  defaults: { variant: 'soft' },
  decorative: true,
  // The PUBLIC API (Path C · Phase 1 → Phase 2 Option A). Static glyph badge — NOT
  // interactive, so NO `behaviour` (no onPress/disabled). Single `variant` axis; the
  // lone `icon` glyph is the SCALAR icon-name shorthand `prop: 'icon'` (`<IconAvatar
  // icon="user" />` · Overrides §1a), the same singular-icon ergonomics as
  // icon-button minus the press affordance. PROP-delivered, so the slot carries NO
  // `default` (Option A · §1c — ⊥ `prop`) and is `required`; with no `default` slot
  // the codegen emits `children?: never` (a decorative badge has no text sink).
  api: {
    axes: ['variant'],
    themeScope: { accent: true },
    slots: {
      icon: { part: 'icon', kind: 'icon-name', prop: 'icon', required: true },
    },
  },
};
