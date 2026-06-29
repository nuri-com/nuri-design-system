/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · AUTHORED SOURCE (hand-maintained)
 *
 * The descriptor LAYER's source of truth (decision 69 · §9 step 1 · N+29 B1):
 * decision 2 (CSS is SoT) is reversed FOR THE DESCRIPTOR LAYER — this hand-
 * authored TS is the producer; build/descriptors/topbar.{ts,js} are emitted FROM
 * it (a verbatim passthrough · pipeline/tokens-parser.js · run `npm run build`).
 * The token vocabulary stays CSS-SoT (decision 63 · ring-fenced).
 *
 * Co-located with the frozen schema (./schema · the same `import type` resolves
 * in BOTH this pipeline location and the emitted build/ location). PURE DATA
 * (no theme thunk · 65.3 §7): structure { anatomy, base } + variants, composed
 * from the five primitive namespaces (65.3 §6) in SEMANTIC names; the engine
 * resolves them (factory on RN · CSS on web · 65.1); behaviour is the factory's,
 * never data. An OPEN layout primitive (the author places positional children);
 * the content pivot's `stack{fill}` is a PART's base; the `center` boolean axis
 * patches the pivot (the host untouched · §8).
 *
 * The hand CSS (lib/components/topbar/topbar.css) still renders web AND still
 * proves this descriptor faithful: Guard D asserts deriveDescriptor(CSS,HTML) ≡
 * this authored data — the parity ORACLE that keeps the inversion faithful +
 * reversible until B2 generates the CSS (the §9 boundary).
 *
 * FROZEN shape (decision 65 step 5 · Guard F); the per-component AXES + VALUES
 * are the editable surface (kept faithful to the live CSS by Guard D · faithful
 * inversion only · the stringly-boolean `center` + title-type gap stay as-is ·
 * first-bump backlog).
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type TopbarAxes = {
  center: 'false' | 'true';
};

export const topbarDescriptor: Descriptor<TopbarAxes> = {
  structure: {
    anatomy: { el: 'view', open: true, parts: { content: { el: 'view' } } },
    base: {
      root: {
        stack: { direction: 'row', align: 'center', gap: 'sm' },
        box: { height: 'lg', paddingStart: 'lg', paddingEnd: 'lg' },
        palette: { chrome: 'canvas' },
      },
      content: {
        stack: { fill: 'grow-shrink' },
      },
    },
  },
  variants: {
    center: {
      false: {},
      true: { content: { stack: { align: 'center', justify: 'center' } } },
    },
  },
};
