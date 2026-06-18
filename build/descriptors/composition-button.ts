/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · COMPOSITION-BUTTON · GENERATED · DO NOT EDIT BY HAND
 *
 * Sources (decision 65 · the composition model 65.3 · one source, two readers · decision 48):
 *   · mapping   — lib/components/button/button.css @layer (axis→namespace values)
 *   · structure — pages/components/button.html data-part anatomy (decision 24.1)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base } +
 * variants, composed from the five primitive namespaces (stack · box ·
 * typography · palette · interactive · 65.3 §6) in SEMANTIC names. The
 * platform-native engine resolves them (factory on RN · CSS on web · 65.1);
 * behaviour (Pressable / press transition / focus / a11y) is the factory's,
 * never data. NEVER hand-edited — re-emit from the sources above.
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
      sm: { root: { box: { minHeight: 'md', paddingX: 'md', radius: 'sm' } }, label: { typography: { size: 'smEm' } } },
      md: { root: { box: { minHeight: 'lg', paddingX: 'lg', radius: 'sm' } }, label: { typography: { size: 'mdEm' } } },
      lg: { root: { box: { minHeight: 'xl', paddingX: 'xl', radius: 'md' } }, label: { typography: { size: 'mdEm' } } },
    },
  },
};
