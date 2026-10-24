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
 * Glyph mode reads `variant` normally. Image mode fills the circle and carries
 * its own always-on translucent ring (the image element's contract); the root's
 * variant paint is SUPPRESSED by the internal content-derived `mode` axis
 * (api.propMaps.contentMode), so `variant` + `source` is a no-op by MECHANISM,
 * not convention. Size `md` is the 48px
 * default with the 24px glyph; `sm` is the 24px compact circle with the 18px
 * glyph (re-specced 36→24 · operator 2026-08-15).
 *
 * INITIALS + ACCESSORY (nuri-com/nuri-design-system#231 · admitted 2026-10-24):
 * `initials` is the third content mode (precedence source > initials > icon ·
 * presence = a non-empty string). Initials mode paints `soft` whatever
 * `variant`/`accent` say (the `mode` axis lock, like image mode) with the type
 * step's own letter-spacing, one line, tail truncation; text in this DECORATIVE
 * descriptor does not follow the OS font scale on RN (renderer rule keyed on
 * `decorative`). `accessory` is a rail glyph on a disc laid over the bottom-end
 * corner (`overlay: 'corner-accessory'` · the engines own placement, ring,
 * hairline and gating): sized by content — the 15px `2xs` glyph + `space.xs`
 * padding = 21px on both surfaces; `accessorySurface` paints `canvas` (default ·
 * every other rail, with the hairline) or `inverse` (Nuri users). Specified for
 * `md` only. The accessory is never the only carrier of the rail: the row names
 * it in text or in its accessibilityLabel.
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
  size: 'sm' | 'md';
  accessorySurface: 'canvas' | 'inverse';
  // INTERNAL content-derived axis (api.propMaps.contentMode) — in the axes
  // type so the variants table typechecks; NOT in api.axes, so no public prop.
  mode: 'glyph' | 'image' | 'initials';
};

export const iconAvatarDescriptor: Descriptor<IconAvatarAxes> = {
  structure: {
    anatomy: {
      el: 'view',
      parts: {
        icon: { el: 'icon' },
        image: { el: 'image' },
        initials: { el: 'text' },
        // The rail disc — LAST, so it paints above the content on both engines.
        accessory: { el: 'view', overlay: 'corner-accessory', parts: { accessoryIcon: { el: 'icon' } } },
      },
    },
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
      // The image is the full 48px circle, not the 24px glyph box. The always-on
      // hairline ring over light image bands is the IMAGE ELEMENT's own contract
      // (border-translucent · black 10% light / white 10% dark · blends over the
      // bitmap — the Separator precedent: an element consuming a border role
      // structurally), NOT a palette variant; the root's variant paint remains
      // underneath and is occluded.
      image: {
        box: { width: 'lg', height: 'lg', radius: 'full' },
        stack: { fill: 'hug' },
      },
      // Initials: md 17px regular (the step's own -0.02em letter-spacing), one line,
      // tail truncation — three or more letters truncate; that is not a feature.
      initials: { typography: { size: 'md', align: 'center', flow: 'truncate', lines: 1 } },
      // The disc has NO width/height: it sizes from its content — the 15px glyph plus
      // `space.xs` (3px) padding = 21px on both surfaces (the canvas hairline takes no
      // layout · the overlay's). Its paint is the accessorySurface axis below.
      accessory: { box: { padding: 'xs', radius: 'full' } },
      accessoryIcon: { box: { width: '2xs', height: '2xs' } },
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
    size: {
      // sm re-specced 36→24 (operator 2026-08-15): the compact inline circle
      // for trigger/field clusters. The glyph steps down with it (18px · the
      // `xs` size leaf) — a 24px glyph would fill the 24px circle edge-to-edge.
      sm: {
        root: { box: { width: 'sm', height: 'sm' } },
        icon: { box: { width: 'xs', height: 'xs' } },
        image: { box: { width: 'sm', height: 'sm' } },
        // xs 13px regular on the 24px circle (not yet seen on a board).
        initials: { typography: { size: 'xs' } },
      },
      md: {},
    },
    // accessorySurface · what the accessory disc paints — the chrome slot, accent-
    // invariant by construction (the topbar/tab-bar `surface` precedent): `canvas`
    // reuses the existing row (the overlay draws the hairline on it); `inverse` is the
    // new chrome slot. A no-op without `accessory` (the gated host never renders).
    accessorySurface: {
      canvas: { accessory: { palette: { chrome: 'canvas' } } },
      inverse: { accessory: { palette: { chrome: 'inverse' } } },
    },
    // mode · INTERNAL content-derived axis (api.propMaps.contentMode — source
    // routed ⇒ image, else glyph · never a public prop). In image mode the
    // root's variant paint is SUPPRESSED (later-wins merge → ghost: transparent,
    // no border): "outline + source = no-op" promoted from convention to
    // mechanism, so the bitmap fills the full circle and the image leaf's own
    // translucent ring is the only border. Keyed AFTER variant deliberately —
    // axis order is the merge order.
    // initials (#231): the same lock — the root paints `soft` (bg-strong +
    // text-primary) whatever `variant`/`accent` say. ListAction forwards an
    // `outline` default, and `solid` + accent would bring per-person colour back.
    mode: {
      glyph: {},
      image: { root: { palette: { variant: 'ghost' } } },
      initials: { root: { palette: { variant: 'soft' } } },
    },
  },
  // The PUBLIC defaults (R1.5 · N+50): an unset `variant` resolves to soft (NOT
  // the variant-order first value `solid`) and an unset size resolves to the 48px
  // `md` circle — the web factory reads them, no hand defaults at the binding.
  // DECORATIVE (decision 50): the host is hidden from
  // AT (aria-hidden) — honest descriptor data the web factory reads, not a hand
  // `aria-hidden` in the registration.
  defaults: { variant: 'soft', size: 'md', accessorySurface: 'canvas' },
  decorative: true,
  // The PUBLIC API (Path C · Phase 1 → Phase 2 Option A). Static glyph badge — NOT
  // interactive, so NO `behaviour` (no onPress/disabled). Variant + size axes; the
  // lone `icon` glyph is the SCALAR icon-name shorthand `prop: 'icon'` (`<IconAvatar
  // icon="user" />` · Overrides §1a), the same singular-icon ergonomics as
  // icon-button minus the press affordance. PROP-delivered, so the slot carries NO
  // `default` (Option A · §1c — ⊥ `prop`). `icon` and `source` are both optional
  // at the type level; the bindings warn once in development when both or neither
  // are supplied, and source wins when both. With no `default` slot the codegen
  // emits `children?: never` (a decorative badge has no text sink).
  // #231: `initials` is the scalar `initials` kind (presence = non-empty string ·
  // the contentMode list makes the precedence source > initials > icon) and
  // `accessory` the scalar icon-name inside the overlay part (orthogonal to the
  // content mode); `accessorySurface` is a public axis.
  api: {
    axes: ['variant', 'size', 'accessorySurface'],
    themeScope: { accent: true },
    propMaps: {
      contentMode: {
        axis: 'mode',
        present: [
          { slot: 'source', value: 'image' },
          { slot: 'initials', value: 'initials' },
        ],
        absent: 'glyph',
      },
    },
    slots: {
      icon: { part: 'icon', kind: 'icon-name', prop: 'icon' },
      source: { part: 'image', kind: 'image-source', prop: 'source' },
      initials: { part: 'initials', kind: 'initials', prop: 'initials' },
      accessory: { part: 'accessoryIcon', kind: 'icon-name', prop: 'accessory' },
    },
  },
};
