/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · COMPOSITION-BUTTON · AUTHORED SOURCE (hand-maintained)
 *
 * The descriptor LAYER's source of truth (decision 69 · §9 step 1 · N+29 B1):
 * decision 2 (CSS is SoT) is reversed FOR THE DESCRIPTOR LAYER — this hand-
 * authored TS is the producer; build/descriptors/composition-button.{ts,js} are
 * emitted FROM it (a verbatim passthrough · pipeline/tokens-parser.js · run
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
 * The hand CSS (lib/components/button/button.css) still renders web AND still
 * proves this descriptor faithful: Guard D (pipeline/docs-drift.test.js) asserts
 * deriveDescriptor(CSS,HTML) ≡ this authored data — the parity ORACLE that keeps
 * the inversion faithful + reversible until B2 generates the CSS (the §9 boundary).
 *
 * FROZEN shape (decision 65 step 5 · Guard F); the per-component AXES + VALUES
 * are the editable surface (kept faithful to the live CSS by Guard D · no R1.5
 * default / real-boolean / fidelity change here · faithful inversion only).
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
