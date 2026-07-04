/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · BUTTON · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/button.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { buttonDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/button.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const buttonDescriptor = {
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
        label: { typography: { size: 'sm', emphasis: true, flow: 'truncate', lines: 1 } },
        icon: { box: { width: 'xs', height: 'xs' } },
      },
      md: {
        root: { box: { minHeight: 'lg', paddingX: 'lg', radius: 'full' } },
        label: { typography: { size: 'md', emphasis: true, flow: 'truncate', lines: 1 } },
        icon: { box: { width: 'sm', height: 'sm' } },
      },
      lg: {
        root: { box: { minHeight: 'xl', paddingX: 'xl', radius: 'full' } },
        label: { typography: { size: 'md', emphasis: true, flow: 'truncate', lines: 1 } },
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
