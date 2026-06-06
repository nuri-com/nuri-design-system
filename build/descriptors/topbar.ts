/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TOPBAR · GENERATED · DO NOT EDIT BY HAND
 *
 * Sources (decision 65 · 65.2 · one source, two readers · decision 48):
 *   · mapping   — lib/components/topbar/topbar.css @layer (variant→style values)
 *   · structure — pages/components/topbar.html data-part anatomy (decision 24.1)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * The frozen contract instance (schema · ./schema). A theme thunk;
 * `$parts` patches the structure-named parts; `typeStep` is the one
 * semantic ref the RN factory (B2 · native) expands via typeStyle.
 * NEVER hand-edited — re-emit from the sources above.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type TopbarAxes = {
  center: 'false' | 'true';
};

export const topbarDescriptor: Descriptor<TopbarAxes> = (_theme) => ({
  variants: {
    center: {
      false: {},
      true: { $parts: { content: { alignItems: 'center', justifyContent: 'center' } } },
    },
  },
});
