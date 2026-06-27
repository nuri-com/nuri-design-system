/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · COMPOSITION-BUTTON · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · pipeline/descriptors/composition-button.ts (the AUTHORED SoT · the
 * descriptor layer is TS-authored as of §9 step 1 · decision 69 · N+29 B1).
 * Emitter · pipeline/tokens-parser.js — run `npm run build` (a verbatim
 * passthrough: the authored DATA is emitted unchanged with this header; the
 * `./schema` import resolves in both locations · the .js twin is the same
 * data type-stripped).
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base } +
 * variants, composed from the five primitive namespaces (stack · box ·
 * typography · palette · interactive · 65.3 §6) in SEMANTIC names. The
 * platform-native engine resolves them (factory on RN · CSS on web · 65.1);
 * behaviour is the factory's, never data. The hand CSS still renders web +
 * still proves this descriptor faithful — Guard D asserts deriveDescriptor(
 * CSS,HTML) ≡ the authored data until B2 generates the CSS. NEVER hand-edit
 * build/ — edit the authored source above (decision 35 · build/ is generated).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type CompositionButtonAxes = {
  variant: 'solid' | 'soft' | 'ghost';
  size: 'sm' | 'md' | 'lg';
};

export const compositionButtonDescriptor: Descriptor<CompositionButtonAxes> = {
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
      sm: { root: { box: { minHeight: 'md', paddingX: 'md', radius: 'sm' } }, label: { typography: { size: 'sm', emphasis: true } } },
      md: { root: { box: { minHeight: 'lg', paddingX: 'lg', radius: 'sm' } }, label: { typography: { size: 'md', emphasis: true } } },
      lg: { root: { box: { minHeight: 'xl', paddingX: 'xl', radius: 'md' } }, label: { typography: { size: 'md', emphasis: true } } },
    },
  },
};
