/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · COMPOSITION-BUTTON · GENERATED · DO NOT EDIT BY HAND
 *
 * Sources (decision 65 · 65.2 · one source, two readers · decision 48):
 *   · mapping   — lib/components/button/button.css @layer (variant→style values)
 *   · structure — pages/components/button.html data-part anatomy (decision 24.1)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * The frozen contract instance (schema · ./schema). A theme thunk;
 * `$parts` patches the structure-named parts; `typeStep` is the one
 * semantic ref the RN factory (B2 · native) expands via typeStyle.
 * NEVER hand-edited — re-emit from the sources above.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type CompositionButtonAxes = {
  variant: 'solid' | 'soft' | 'ghost';
  size: 'sm' | 'md' | 'lg';
};

export const compositionButtonDescriptor: Descriptor<CompositionButtonAxes> = (theme) => ({
  variants: {
    variant: {
      solid: { backgroundColor: theme.surface.solid.bg, $parts: { label: { color: theme.surface.solid.fg } } },
      soft: { backgroundColor: theme.surface.soft.bg, $parts: { label: { color: theme.surface.soft.fg } } },
      ghost: { backgroundColor: theme.surface.ghost.bg, $parts: { label: { color: theme.surface.ghost.fg } } },
    },
    size: {
      sm: { minHeight: theme.size.md, paddingHorizontal: theme.space.md, borderRadius: theme.radius.sm, $parts: { label: { typeStep: 'smEm' } } },
      md: { minHeight: theme.size.lg, paddingHorizontal: theme.space.lg, borderRadius: theme.radius.sm, $parts: { label: { typeStep: 'mdEm' } } },
      lg: { minHeight: theme.size.xl, paddingHorizontal: theme.space.xl, borderRadius: theme.radius.md, $parts: { label: { typeStep: 'mdEm' } } },
    },
  },
  compoundVariants: [
    { variant: 'solid', pressed: true, styles: { backgroundColor: theme.surface.solid.pressedBg } },
    { variant: 'soft', pressed: true, styles: { backgroundColor: theme.surface.soft.pressedBg } },
    { variant: 'ghost', pressed: true, styles: { backgroundColor: theme.surface.ghost.pressedBg } },
    { pressed: true, styles: { transform: [{ scale: theme.interaction.pressScale }] } },
    { disabled: true, styles: { opacity: theme.interaction.disabledOpacity } },
  ],
});
