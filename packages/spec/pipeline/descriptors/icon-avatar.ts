/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-AVATAR · AUTHORED SOURCE (hand-maintained)
 *
 * The descriptor LAYER's source of truth (decision 69 · §9 step 1 · N+29 B1):
 * decision 2 (CSS is SoT) is reversed FOR THE DESCRIPTOR LAYER — this hand-
 * authored TS is the producer; build/descriptors/icon-avatar.{ts,js} are emitted
 * FROM it (a verbatim passthrough · pipeline/tokens-parser.js · run `npm run
 * build`). The token vocabulary stays CSS-SoT (decision 63 · ring-fenced).
 *
 * Co-located with the frozen schema (./schema · the same `import type` resolves
 * in BOTH this pipeline location and the emitted build/ location). PURE DATA
 * (no theme thunk · 65.3 §7): structure { anatomy, base } + variants, composed
 * from the five primitive namespaces (65.3 §6) in SEMANTIC names; the engine
 * resolves them (factory on RN · CSS on web · 65.1); behaviour is the factory's,
 * never data. Static surface — no `interactive` opt-in (65.3 · the IconAvatar
 * story); the full surface INCLUDING `subtle` (the fg-only role · 65.1).
 *
 * The hand CSS (lib/components/icon-avatar/icon-avatar.css) still renders web AND
 * still proves this descriptor faithful: Guard D asserts deriveDescriptor(CSS,
 * HTML) ≡ this authored data — the parity ORACLE that keeps the inversion
 * faithful + reversible until B2 generates the CSS (the §9 boundary).
 *
 * FROZEN shape (decision 65 step 5 · Guard F); the per-component AXES + VALUES
 * are the editable surface (kept faithful to the live CSS by Guard D · faithful
 * inversion only · no R1.5 fidelity change here).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type IconAvatarAxes = {
  variant: 'solid' | 'soft' | 'ghost' | 'subtle';
};

export const iconAvatarDescriptor: Descriptor<IconAvatarAxes> = {
  structure: {
    anatomy: { el: 'view', parts: { icon: { el: 'icon' } } },
    base: {
      root: {
        stack: { align: 'center', justify: 'center' },
        box: { width: 'lg', height: 'lg', radius: 'full' },
      },
    },
  },
  variants: {
    variant: {
      solid: { root: { palette: { variant: 'solid' } } },
      soft: { root: { palette: { variant: 'soft' } } },
      ghost: { root: { palette: { variant: 'ghost' } } },
      subtle: { root: { palette: { variant: 'subtle' } } },
    },
  },
};
