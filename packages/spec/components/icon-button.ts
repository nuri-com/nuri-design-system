/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-BUTTON · AUTHORED SOURCE (hand-maintained)
 *
 * The ICON-ANCHORED control (P11 · the catalog's FIRST contract bump): the icon
 * is the structural centre, with OPTIONAL `prefix` / `suffix` text flanking it —
 * bare (`icon` only) reads as the round action; flanked (`prefix 🍎 suffix`) is
 * the brand-lockup / Apple-Pay pattern (`Buy Bitcoin 🍎 Pay`). This is the one
 * way to put an icon ON a button — `<nuri-button>` stays text-only.
 *
 * The anatomy declares THREE non-root parts (`prefix` · `icon` · `suffix`), so
 * there is no lone `primaryPart`: the factories route the ergonomic `prefix` /
 * `suffix` / `icon` props into the per-part content map (an absent flank renders
 * NOTHING — the leaf is skipped — so the bare control collapses to the icon, no
 * empty text nodes inflating the stack gap). a11y is dual-mode: bare needs an
 * accessible name (aria-label / accessibilityLabel); flanked, the visible text
 * IS the name (behaviour is the factory's · decision 65).
 *
 * SIZE keeps minHeight + radius coherent with composition-button (sm/md/lg → the
 * SAME minHeight · radius `full`), pinned by the size-coherence guard
 * (pipeline/docs-drift.test.js) so a Button and an icon-button at one size share a
 * height + corner and sit coherently in a row. paddingX INTENTIONALLY DIVERGES —
 * the root carries only a small `sm` ring, and `minWidth` = minHeight floors the
 * BARE form to a perfect square (the glyph centres; the small paddingX is absorbed
 * by the border-box floor · sm 36² · md 48² · lg 54²). The FLANKED form grows past
 * the floor; its text breathing-room rides `prefix.paddingStart` / `suffix.padding
 * End` (per size · so only the flanked edges widen, to ≈ Button's paddingX). The
 * icon's own `box` sizes the glyph (sm → the xs leaf 18px · md/lg → the sm leaf
 * 24px · the icon-arc shared box axis · N+51); the prefix/suffix typography mirrors
 * the button label (sm → size sm · md/lg → size md · emphasis on). The shared-size
 * fragment extraction is a deliberate FOLLOW-UP — mirror + drift-guard now.
 *
 * The bare circle's SURFACES (solid/soft/ghost bg·fg·pressed) + the pressed/
 * scale/disabled interaction hold parity with the legacy icon-button via the
 * SAME palette funnel + interaction baseline composition-button uses (the legacy
 * CSS is the oracle for the bare circle only · the flanked layout is new design,
 * validated by render). PURE DATA (no theme thunk · 65.3 §7): structure
 * { anatomy, base } + variants in SEMANTIC names; the platform-native engine
 * resolves them (factory on RN · CSS on web · 65.1).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type IconButtonAxes = {
  variant: 'solid' | 'soft' | 'ghost';
  size: 'sm' | 'md' | 'lg';
};

export const iconButtonDescriptor: Descriptor<IconButtonAxes> = {
  structure: {
    anatomy: {
      el: 'view',
      // Authored in VISUAL row order (prefix → icon → suffix · left → centre →
      // right): both factories walk the anatomy in key order, so this IS the
      // rendered order on RN and web (the twin is a verbatim passthrough · the
      // PART_ORDER re-sort matches this same order · parity-load-bearing).
      parts: {
        prefix: { el: 'text' },
        icon: { el: 'icon' },
        suffix: { el: 'text' },
      },
    },
    base: {
      root: {
        // The anchored row: the icon centres, the optional flanks sit beside it
        // with a gap (only between RENDERED items — a bare control has one item,
        // so the gap never widens the circle).
        stack: { direction: 'row', align: 'center', justify: 'center', gap: 'sm' },
        interactive: { pressColor: true, pressScale: true, disabledOpacity: true },
      },
    },
  },
  variants: {
    variant: {
      solid: { root: { palette: { variant: 'solid' } } },
      soft: { root: { palette: { variant: 'soft' } } },
      ghost: { root: { palette: { variant: 'ghost' } } },
    },
    // SIZE · minHeight + radius stay coherent with composition-button; minWidth =
    // minHeight floors the bare control to a SQUARE (the root paddingX is the icon
    // edge ring — sm 6 · md/lg 12 — absorbed by the border-box floor, so the bare
    // form stays square while the icon-at-an-edge in the single-flank forms gets a
    // comfortable gap). The flank paddingStart/End add the FLANKED text's own edge
    // breathing-room on top. The icon `box` sizes the glyph; prefix/suffix
    // typography mirrors the button label.
    size: {
      sm: {
        root: { box: { minHeight: 'md', minWidth: 'md', paddingX: 'sm', radius: 'full' } },
        prefix: { box: { paddingStart: 'sm' }, typography: { size: 'sm', emphasis: true } },
        icon: { box: { width: 'xs', height: 'xs' } },
        suffix: { box: { paddingEnd: 'sm' }, typography: { size: 'sm', emphasis: true } },
      },
      md: {
        root: { box: { minHeight: 'lg', minWidth: 'lg', paddingX: 'md', radius: 'full' } },
        prefix: { box: { paddingStart: 'md' }, typography: { size: 'md', emphasis: true } },
        icon: { box: { width: 'sm', height: 'sm' } },
        suffix: { box: { paddingEnd: 'md' }, typography: { size: 'md', emphasis: true } },
      },
      lg: {
        root: { box: { minHeight: 'xl', minWidth: 'xl', paddingX: 'md', radius: 'full' } },
        prefix: { box: { paddingStart: 'lg' }, typography: { size: 'md', emphasis: true } },
        icon: { box: { width: 'sm', height: 'sm' } },
        suffix: { box: { paddingEnd: 'lg' }, typography: { size: 'md', emphasis: true } },
      },
    },
  },
  // The PUBLIC defaults (R1.5 · N+50) — soft + md, mirroring the legacy
  // icon-button's soft default. Both factories read this; neither binding
  // hand-passes a default.
  defaults: { variant: 'soft', size: 'md' },
};
