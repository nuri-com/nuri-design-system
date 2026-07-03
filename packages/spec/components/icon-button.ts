/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-BUTTON · AUTHORED SOURCE (hand-maintained)
 *
 * The conventional ICON-ONLY glyph circle: a single `icon` part is the whole
 * control, `minWidth = minHeight` squares it, `radius full` rounds it. This is
 * the round pressable action (`<IconButton icon="apple" />`) — `<nuri-button>`
 * stays text-only. The anchored mid-text lockup (`Buy Bitcoin 🍎 Pay`) that this
 * descriptor once carried has RELOCATED to composable Button (ordered
 * `ButtonText`/`ButtonIcon` children · Path C Phase 4 · docs/archive/component-api-target.md);
 * rich content is composition, never a flank prop.
 *
 * The anatomy declares ONE non-root part (`icon`) — the lone primary: the factory
 * routes the ergonomic `icon` prop (the same-name shorthand · a scalar icon-name,
 * not a subtree) into it. a11y needs an accessible name — there is no visible text
 * to name the control — supplied per-platform: `accessibilityLabel` on RN ·
 * `aria-label`/`label` on web (the budgeted platform diff · behaviour is the
 * factory's · decision 65).
 *
 * SIZE keeps minHeight + radius coherent with button (sm/md/lg → the SAME
 * minHeight · radius `full`), pinned by the size-coherence guard
 * (pipeline/docs-drift.test.js) so a Button and an icon-button at one size share a
 * height + corner and sit coherently in a row. paddingX INTENTIONALLY DIVERGES —
 * the root carries only a small icon-edge ring, and `minWidth` = minHeight floors
 * the control to a perfect square (the glyph centres; the small paddingX is
 * absorbed by the border-box floor · sm 36² · md 48² · lg 54²). The icon's own
 * `box` sizes the glyph (sm → the xs leaf 18px · md/lg → the sm leaf 24px · the
 * icon-arc shared box axis · N+51).
 *
 * The circle's SURFACES (solid/soft/ghost bg·fg·pressed) + the pressed/scale/
 * disabled interaction hold parity with the legacy icon-button via the SAME
 * palette funnel + interaction baseline button uses. PURE DATA (no theme thunk ·
 * 65.3 §7): structure { anatomy, base } + variants in SEMANTIC names; the
 * platform-native engine resolves them (factory on RN · CSS on web · 65.1).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type IconButtonAxes = {
  variant: 'solid' | 'soft' | 'ghost';
  size: 'sm' | 'md' | 'lg';
};

export const iconButtonDescriptor: Descriptor<IconButtonAxes> = {
  structure: {
    anatomy: {
      el: 'pressable',
      // ONE non-root part: the glyph is the whole control (the lone primary · the
      // `icon` prop routes here via the factory same-name shorthand).
      parts: {
        icon: { el: 'icon' },
      },
    },
    base: {
      root: {
        // The centred round action: the single glyph sits dead-centre; the row
        // stack + gap are inert with one item (kept for parity with the coherent
        // Button root · a bare circle has nothing to space).
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
    // SIZE · minHeight + radius stay coherent with button; minWidth =
    // minHeight floors the control to a SQUARE (the root paddingX is the icon
    // edge ring — sm 6 · md/lg 12 — absorbed by the border-box floor, so the
    // glyph centres in a perfect square). The icon `box` sizes the glyph.
    size: {
      sm: {
        root: { box: { minHeight: 'md', minWidth: 'md', paddingX: 'sm', radius: 'full' } },
        icon: { box: { width: 'xs', height: 'xs' } },
      },
      md: {
        root: { box: { minHeight: 'lg', minWidth: 'lg', paddingX: 'md', radius: 'full' } },
        icon: { box: { width: 'sm', height: 'sm' } },
      },
      lg: {
        root: { box: { minHeight: 'xl', minWidth: 'xl', paddingX: 'md', radius: 'full' } },
        icon: { box: { width: 'sm', height: 'sm' } },
      },
    },
  },
  // The PUBLIC defaults (R1.5 · N+50) — soft + md, mirroring the legacy
  // icon-button's soft default. Both factories read this; neither binding
  // hand-passes a default.
  defaults: { variant: 'soft', size: 'md' },
  // The PUBLIC API (Path C · Phase 1 → Phase 2 Option A). Icon-ONLY (B0 ·
  // prefix/suffix retired): the lone `icon` glyph is the whole control, exposed as
  // the SCALAR icon-name shorthand `prop: 'icon'` (`<IconButton icon="apple" />` ·
  // Overrides §1a — a string token, kind-gated to `icon-name`, not the soup). The
  // glyph is PROP-delivered, NOT a children-sink, so the slot carries NO `default`
  // (Option A · §1c — `default:true` means "the untagged-children sink", ⊥ `prop`)
  // and is `required` (`icon` is not optional · the control has nothing else). With
  // no `default` slot the codegen emits `children?: never`. variant × size + the
  // pressable root (all three channels), like Button.
  api: {
    axes: ['variant', 'size'],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      icon: { part: 'icon', kind: 'icon-name', prop: 'icon', required: true },
    },
  },
};
