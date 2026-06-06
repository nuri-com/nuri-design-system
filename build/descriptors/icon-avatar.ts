/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ICON-AVATAR · GENERATED · DO NOT EDIT BY HAND
 *
 * Sources (decision 65 · 65.2 · one source, two readers · decision 48):
 *   · mapping   — lib/components/icon-avatar/icon-avatar.css @layer (variant→style values)
 *   · structure — pages/components/icon-avatar.html data-part anatomy (decision 24.1)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * The frozen contract instance (schema · ./schema). A theme thunk;
 * `$parts` patches the structure-named parts; `typeStep` is the one
 * semantic ref the RN factory (B2 · native) expands via typeStyle.
 * NEVER hand-edited — re-emit from the sources above.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type IconAvatarAxes = {
  variant: 'solid' | 'soft' | 'ghost' | 'subtle';
};

export const iconAvatarDescriptor: Descriptor<IconAvatarAxes> = (theme) => ({
  variants: {
    variant: {
      solid: { backgroundColor: theme.surface.solid.bg, $parts: { icon: { color: theme.surface.solid.fg } } },
      soft: { backgroundColor: theme.surface.soft.bg, $parts: { icon: { color: theme.surface.soft.fg } } },
      ghost: { backgroundColor: theme.surface.ghost.bg, $parts: { icon: { color: theme.surface.ghost.fg } } },
      subtle: { backgroundColor: theme.surface.subtle.bg, $parts: { icon: { color: theme.surface.subtle.fg } } },
    },
  },
});
