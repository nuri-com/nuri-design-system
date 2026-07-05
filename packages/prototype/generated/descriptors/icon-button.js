/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-BUTTON · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/icon-button.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { iconButtonDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/icon-button.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const iconButtonDescriptor = {
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
