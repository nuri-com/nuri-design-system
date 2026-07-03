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
