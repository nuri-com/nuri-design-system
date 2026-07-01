/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · BUTTON · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of build/descriptors/button.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { buttonDescriptor }`
 * from it at runtime with NO build step — the runtime web factory
 * (lib/runtime/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · pipeline/descriptors/button.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · pipeline/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edit build/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const buttonDescriptor = {
  structure: {
    anatomy: { el: 'view', parts: { label: { el: 'text' } } },
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
      sm: { root: { box: { minHeight: 'md', paddingX: 'md', radius: 'full' } }, label: { typography: { size: 'sm', emphasis: true } } },
      md: { root: { box: { minHeight: 'lg', paddingX: 'lg', radius: 'full' } }, label: { typography: { size: 'md', emphasis: true } } },
      lg: { root: { box: { minHeight: 'xl', paddingX: 'xl', radius: 'full' } }, label: { typography: { size: 'md', emphasis: true } } },
    },
  },
  // The PUBLIC defaults (R1.5 · N+50): an unset axis resolves to these — soft
  // (NOT the variant-order first value `solid`), md (NOT `sm`). Both factories
  // read this, so neither binding hand-passes a default (the web↔RN parity close).
  defaults: { variant: 'soft', size: 'md' },
  // The PUBLIC API (Path C · Phase 1 · docs/component-api-target.md). variant ×
  // size surface as style props; the root is the pressable target (all three
  // interactive channels are opted in on `structure.base`). ONE content slot:
  // the label text is the default children (`<Button>Buy</Button>`). Rich mid-text
  // lockups (repeatable composed `text`/`icon` children) are a Phase-4 addition.
  api: {
    axes: ['variant', 'size'],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    slots: {
      default: { part: 'label', kind: 'text', default: true },
    },
  },
};
