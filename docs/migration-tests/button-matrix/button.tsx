/* ══════════════════════════════════════════════════════════════════
 * BUTTON · the RN side of <nuri-button>
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors button.js (the web custom-element):
 *   variant?: 'solid' | 'soft'         default 'soft'
 *   accent?:  'lilac'  | 'neutral'     overrides ambient context
 *   size?:    'lg' | 'md' | 'sm'       default 'md'  (decision 41 · 55)
 *   disabled?: boolean
 *   onPress?: () => void
 *   children: string (label only — no slot for icons; Button is text-only today)
 *
 * SIZE (decision 41 · D2 · N+13) · faithful to button.js ATTRS. The
 * emitted button.ts carries the per-size geometry triples (lg/md/sm ×
 * MinHeight/PaddingX/Radius); this mirror selects the triple by `size`
 * and resolves it through the runtime sets exactly as the md-locked
 * path did. Decision 55 couples the LABEL type to size: sm → type-sm-em,
 * md/lg → type-md-em — so the label's typeStyle key tracks the size,
 * not a fixed mdEm. No new token surface (the web already emits these).
 *
 * Behavioural deltas the web side hides (see FRICTIONS.md):
 *   - Pressed state · web fires :active automatically via CSS; here
 *     Pressable's `pressed` render-prop drives the variant swap.
 *   - No focus ring · RN has no DOM focus model (F-FOCUS-1).
 *   - No cursor · disabled buttons can't show `not-allowed` (F-DISABLED-1).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  NuriThemeContext,
  resolveToken,
  typeStyle,
  button,
  chrome,
  accentTokens,
  space,
  size,
  radius,
  type Accent,
  type Theme,
  type TypeKey,
  type TokenPath,
  type RuntimeTokens,
} from './_shared';

export type ButtonSize = 'lg' | 'md' | 'sm';

export type ButtonProps = {
  variant?: 'solid' | 'soft';
  accent?: Accent;
  size?: ButtonSize;
  disabled?: boolean;
  onPress?: () => void;
  children: string;
};

// Per-size geometry triple (button.ts emits one per size · decision 41)
// + the label type key decision 55 couples to size (sm → smEm; md/lg → mdEm).
const GEOMETRY: Record<ButtonSize, { minHeight: TokenPath; paddingX: TokenPath; radius: TokenPath }> = {
  lg: { minHeight: button.lgMinHeight, paddingX: button.lgPaddingX, radius: button.lgRadius },
  md: { minHeight: button.mdMinHeight, paddingX: button.mdPaddingX, radius: button.mdRadius },
  sm: { minHeight: button.smMinHeight, paddingX: button.smPaddingX, radius: button.smRadius },
};
const LABEL_KEY: Record<ButtonSize, TypeKey> = { lg: 'mdEm', md: 'mdEm', sm: 'smEm' };

export const Button: React.FC<ButtonProps> = ({
  variant = 'soft',
  accent: accentProp,
  size: sizeProp = 'md',
  disabled,
  onPress,
  children,
}) => {
  // Tier 2 self-scope · `accent` prop wins over ambient context.
  // Mirrors button.js #sync: if prop set, mirror to data-accent on
  // the inner button; if absent, inherit. The inherit path is an inline
  // merge over the single NuriThemeContext (prop-wins semantics).
  const { mode, accent: ambientAccent } = React.useContext(NuriThemeContext);
  const accent: Accent = accentProp ?? ambientAccent;

  // N+6.1 consumer-side static-vs-dynamic split (decision 36 ·
  // amendment 36.1 · N+6.1.1): `minHeight` + `paddingHorizontal` +
  // `borderRadius` all reference runtime sets (size / space / radius),
  // so their values aren't known at module load and can't live in
  // StyleSheet.create. Resolve at render time through resolveToken
  // against the live `tokens` slice.
  const tokens: RuntimeTokens = {
    chrome: chrome[mode],
    accent: accentTokens[accent][mode],
    space,
    size,
    radius,
  };
  const geometry = GEOMETRY[sizeProp];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight:         resolveToken(tokens, geometry.minHeight) as number,
          paddingHorizontal: resolveToken(tokens, geometry.paddingX)  as number,
          borderRadius:      resolveToken(tokens, geometry.radius)    as number,
        },
        variantStyle(variant, accent, mode, pressed),
        pressed && !disabled && { transform: [{ scale: button.pressScale }] },
        disabled && { opacity: button.disabledOpacity },
      ]}
    >
      <Text
        style={[
          typeStyle(LABEL_KEY[sizeProp]),
          { color: labelColor(variant, accent, mode) },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

// ── Variant + accent + pressed → background colour ────────────────
// Web equivalent: button.css `.nuri-button--{variant}` + `:active`
// override. We compute the literal each render (tier+accent+pressed
// combinatorics blow up a memoised cache; inline saves the bookkeeping).
// TokenPath consumption (decision 34): `button.solidBg` emits as the
// literal `'accent.solid' as const satisfies TokenPath`; resolveToken
// dereferences against the live (accent × theme) slice.
export function variantStyle(
  variant: 'solid' | 'soft',
  accent: Accent,
  theme: Theme,
  pressed: boolean,
): StyleProp<ViewStyle> {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  if (variant === 'solid') {
    return {
      backgroundColor: resolveToken(tokens, pressed ? button.solidBgPressed : button.solidBg) as string,
    };
  }
  // soft · chrome-only, accent-invariant (P7)
  return {
    backgroundColor: resolveToken(tokens, pressed ? button.softBgPressed : button.softBg) as string,
  };
}

export function labelColor(variant: 'solid' | 'soft', accent: Accent, theme: Theme): string {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  return resolveToken(tokens, variant === 'solid' ? button.solidFg : button.softFg) as string;
}

// Button-internal base styling. radius/minHeight/paddingX are runtime-set
// leaves resolved inline (above), so only the geometry-invariant flex bits
// live in the static sheet. The label type sources from the shared scale
// (decision 54/55) and now tracks `size` (LABEL_KEY) — applied inline at
// the call site, not baked here.
const styles = StyleSheet.create({
  base: {
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'row',
    flex:           1,
  },
});
