/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-AVATAR · AUTHORED SOURCE (hand-maintained)
 *
 * The descriptor LAYER's source of truth (decision 69 · §9 step 1 · N+29 B1):
 * decision 2 (CSS is SoT) is reversed FOR THE DESCRIPTOR LAYER — this hand-
 * authored TS is the producer; the browser-ESM twin generated/descriptors/icon-avatar.js is emitted
 * FROM it (a verbatim passthrough · scripts/tokens-parser.js · run `npm run
 * build`). The token vocabulary stays CSS-SoT (decision 63 · ring-fenced).
 *
 * Co-located with the frozen schema (./schema · the same `import type` resolves
 * in BOTH this pipeline location and the emitted build/ location). PURE DATA
 * (no theme thunk · 65.3 §7): structure { anatomy, base } + variants, composed
 * from the five primitive namespaces (65.3 §6) in SEMANTIC names; the engine
 * resolves them (factory on RN · CSS on web · 65.1); behaviour is the factory's,
 * never data. Static surface — no `interactive` opt-in (65.3 · the IconAvatar
 * story); the full surface INCLUDING `subtle` (the fg-only role · 65.1).
 *
 * The old hand CSS/page oracle is retired; this descriptor is now the SOLE SoT.
 * Guard D (scripts/docs-drift.test.js) re-emits the browser-ESM twin and pins the
 * composition-form shape, while the projection guards exercise the generated RN/web
 * contracts derived from this data.
 *
 * FROZEN shape (decision 65 step 5 · Guard F); the per-component AXES + VALUES
 * are the editable surface (kept structurally pinned by Guard D · no R1.5 fidelity
 * change here).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type IconAvatarAxes = {
  variant: 'solid' | 'soft' | 'ghost' | 'subtle' | 'outline';
};

export const iconAvatarDescriptor: Descriptor<IconAvatarAxes> = {
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
      outline: { root: { palette: { variant: 'outline' } } },
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
