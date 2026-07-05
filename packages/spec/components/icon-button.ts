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
 * ONE FIXED SIZE (48² · the former `md`): the size axis is retired — the control
 * is a single 48px circle (minHeight = minWidth = the `lg` size leaf), baked into
 * `structure.base`. `minWidth` = minHeight floors the control to a perfect square
 * (the glyph centres; the small `md` paddingX icon-edge ring is absorbed by the
 * border-box floor). The icon's own `box` sizes the glyph (the `sm` leaf · 24px).
 * With no size axis there is no Button-row coherence to pin, so the old
 * size-coherence guard is retired (a 48 circle sits between Button's sm 36 / lg 54).
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
      // The centred round action, FIXED at 48² (the former `md`): minHeight =
      // minWidth = the `lg` leaf floors it to a square, `md` paddingX is the icon
      // edge ring (absorbed by the border-box floor), radius `full` rounds it. The
      // single glyph sits dead-centre; the row stack + gap are inert with one item.
      root: {
        stack: { direction: 'row', align: 'center', justify: 'center', gap: 'sm' },
        box: { minHeight: 'lg', minWidth: 'lg', paddingX: 'md', radius: 'full' },
        interactive: { pressColor: true, pressScale: true, disabledOpacity: true },
      },
      // The glyph size (the `sm` leaf · 24px).
      icon: { box: { width: 'sm', height: 'sm' } },
    },
  },
  variants: {
    variant: {
      solid: { root: { palette: { variant: 'solid' } } },
      soft: { root: { palette: { variant: 'soft' } } },
      ghost: { root: { palette: { variant: 'ghost' } } },
    },
  },
  // The PUBLIC default (R1.5 · N+50) — soft, mirroring the legacy icon-button's
  // soft default. Size is no longer an axis (one fixed 48 base). Both factories
  // read this; neither binding hand-passes a default.
  defaults: { variant: 'soft' },
  // The PUBLIC API (Path C · Phase 1 → Phase 2 Option A). Icon-ONLY (B0 ·
  // prefix/suffix retired): the lone `icon` glyph is the whole control, exposed as
  // the SCALAR icon-name shorthand `prop: 'icon'` (`<IconButton icon="apple" />` ·
  // Overrides §1a — a string token, kind-gated to `icon-name`, not the soup). The
  // glyph is PROP-delivered, NOT a children-sink, so the slot carries NO `default`
  // (Option A · §1c — `default:true` means "the untagged-children sink", ⊥ `prop`)
  // and is `required` (`icon` is not optional · the control has nothing else). With
  // no `default` slot the codegen emits `children?: never`. variant only (size
  // retired · one fixed 48 base) + the pressable root (all three channels), like Button.
  api: {
    axes: ['variant'],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      icon: { part: 'icon', kind: 'icon-name', prop: 'icon', required: true },
    },
  },
};
