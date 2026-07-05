/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · BUTTON · AUTHORED SOURCE (hand-maintained)
 *
 * The descriptor LAYER's source of truth (decision 69 · §9 step 1 · N+29 B1):
 * decision 2 (CSS is SoT) is reversed FOR THE DESCRIPTOR LAYER — this hand-
 * authored TS is the producer; the browser-ESM twin generated/descriptors/button.js is
 * emitted FROM it (a verbatim passthrough · scripts/tokens-parser.js · run
 * `npm run build`). The token vocabulary stays CSS-SoT (decision 63 · ring-fenced
 * · NOT inverted) — this session is the descriptor layer only.
 *
 * Co-located with the frozen schema (./schema · the same `import type` resolves
 * in BOTH this pipeline location and the emitted build/ location · so the
 * passthrough rewrites nothing). PURE DATA (no theme thunk · 65.3 §7): structure
 * { anatomy, base } + variants, composed from the five primitive namespaces
 * (stack · box · typography · palette · interactive · 65.3 §6) in SEMANTIC names;
 * the platform-native engine resolves them (factory on RN · CSS on web · 65.1);
 * behaviour (Pressable / press transition / focus / a11y) is the factory's,
 * never data.
 *
 * The old hand CSS/page oracle is retired; this descriptor is now the SOLE SoT.
 * Guard D (scripts/docs-drift.test.js) re-emits the browser-ESM twin and pins the
 * composition-form shape, while the projection guards exercise the generated RN/web
 * contracts derived from this data.
 *
 * FROZEN shape (decision 65 step 5 · Guard F); the per-component AXES + VALUES
 * are the editable surface (kept structurally pinned by Guard D · no R1.5 default /
 * real-boolean / fidelity change here).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type ButtonAxes = {
  variant: 'solid' | 'soft';
  size: 'sm' | 'lg';
  // How the button sits as a flex child of its parent row (the root's stack.fill).
  // `natural` (default) composes nothing → the bare flex 0 1 auto: hugs its label,
  // MAY shrink+truncate under row pressure, and a column parent's `align:stretch`
  // already gives it full width (so a full-width CTA needs NO fill). `even` = take
  // an equal share of a ROW (flex 1 1 0 · the split-button pair · usually the
  // parent's `distribute` owns this, this is the per-instance escape hatch). `hug` =
  // hug the label and NEVER shrink (flex 0 0 auto · the alert/field trailing action,
  // set in the parent's composition via props). NOT `grow`/`grow-shrink` — those are
  // layout-container concerns, not a leaf control's.
  fill: 'natural' | 'even' | 'hug';
};

export const buttonDescriptor: Descriptor<ButtonAxes> = {
  structure: {
    anatomy: { el: 'pressable', parts: { label: { el: 'text' }, icon: { el: 'icon' } } },
    base: {
      root: {
        stack: { direction: 'row', align: 'center', justify: 'center' },
        interactive: { pressColor: true, pressScale: true, disabledOpacity: true },
      },
    },
  },
  variants: {
    variant: {
      solid: { root: { palette: { variant: 'solid' } } },
      soft: { root: { palette: { variant: 'soft' } } },
    },
    size: {
      sm: {
        root: { stack: { gap: 'xs' }, box: { minHeight: 'md', paddingX: 'lg', radius: 'full' } },
        label: { typography: { size: 'sm', emphasis: true, flow: 'truncate', lines: 1 } },
        icon: { box: { width: 'xs', height: 'xs' } },
      },
      lg: {
        root: { stack: { gap: 'sm' }, box: { minHeight: 'xl', paddingX: 'xl', radius: 'full' } },
        label: { typography: { size: 'md', emphasis: true, flow: 'truncate', lines: 1 } },
        icon: { box: { width: 'sm', height: 'sm' } },
      },
    },
    // The parent-row fill axis (see ButtonAxes). `natural` is the no-op default
    // (composes nothing → the bare flex 0 1 auto); `even`/`hug` set the root's
    // stack.fill. Layered onto variant × size, not crossed (per-axis composition).
    fill: {
      natural: {},
      even: { root: { stack: { fill: 'even' } } },
      hug: { root: { stack: { fill: 'hug' } } },
    },
  },
  // The PUBLIC defaults (R1.5 · N+50): an unset axis resolves to these — soft
  // (NOT the variant-order first value `solid`), lg (the large control · the two-
  // size scale is sm/lg). Both factories read this, so neither binding hand-passes
  // a default (the web↔RN parity close).
  defaults: { variant: 'soft', size: 'lg', fill: 'natural' },
  // The PUBLIC API (Path C · Phase 1 · docs/archive/component-api-target.md). variant ×
  // size surface as style props; the root is the pressable target (all three
  // interactive channels are opted in on `structure.base`). Bare untagged
  // children still sink to the label (`<Button>Buy</Button>`). The composed
  // lockup uses ordered, repeatable generated leaves:
  // `<Button><ButtonText>Buy</ButtonText><ButtonIcon name="apple" /></Button>`.
  api: {
    axes: ['variant', 'size', 'fill'],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      default: { part: 'label', kind: 'text', default: true },
      text: { part: 'label', kind: 'text', component: true, multiple: true },
      icon: { part: 'icon', kind: 'icon-name', component: true, multiple: true },
    },
  },
};
