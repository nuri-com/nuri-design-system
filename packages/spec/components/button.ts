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
  variant: 'solid' | 'soft' | 'ghost';
  size: 'sm' | 'md' | 'lg';
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
      ghost: { root: { palette: { variant: 'ghost' } } },
    },
    size: {
      sm: {
        root: { box: { minHeight: 'md', paddingX: 'md', radius: 'full' } },
        label: { typography: { size: 'sm', emphasis: true } },
        icon: { box: { width: 'xs', height: 'xs' } },
      },
      md: {
        root: { box: { minHeight: 'lg', paddingX: 'lg', radius: 'full' } },
        label: { typography: { size: 'md', emphasis: true } },
        icon: { box: { width: 'sm', height: 'sm' } },
      },
      lg: {
        root: { box: { minHeight: 'xl', paddingX: 'xl', radius: 'full' } },
        label: { typography: { size: 'md', emphasis: true } },
        icon: { box: { width: 'sm', height: 'sm' } },
      },
    },
  },
  // The PUBLIC defaults (R1.5 · N+50): an unset axis resolves to these — soft
  // (NOT the variant-order first value `solid`), md (NOT `sm`). Both factories
  // read this, so neither binding hand-passes a default (the web↔RN parity close).
  defaults: { variant: 'soft', size: 'md' },
  // The PUBLIC API (Path C · Phase 1 · docs/archive/component-api-target.md). variant ×
  // size surface as style props; the root is the pressable target (all three
  // interactive channels are opted in on `structure.base`). Bare untagged
  // children still sink to the label (`<Button>Buy</Button>`). The composed
  // lockup uses ordered, repeatable generated leaves:
  // `<Button><ButtonText>Buy</ButtonText><ButtonIcon name="apple" /></Button>`.
  api: {
    axes: ['variant', 'size'],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      default: { part: 'label', kind: 'text', default: true },
      text: { part: 'label', kind: 'text', component: true, multiple: true },
      icon: { part: 'icon', kind: 'icon-name', component: true, multiple: true },
    },
  },
};
