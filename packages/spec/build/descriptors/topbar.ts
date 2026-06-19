/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · GENERATED · DO NOT EDIT BY HAND
 *
 * Sources (decision 65 · the composition model 65.3 · one source, two readers · decision 48):
 *   · mapping   — lib/components/topbar/topbar.css @layer (axis→namespace values)
 *   · structure — pages/components/topbar.html data-part anatomy (decision 24.1)
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
