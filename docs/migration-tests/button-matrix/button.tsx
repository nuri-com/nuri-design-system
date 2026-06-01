/* ══════════════════════════════════════════════════════════════════
 * BUTTON · the RN side of <nuri-button>
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors button.js (the web custom-element):
 *   variant?: 'solid' | 'soft'         default 'soft'
 *   accent?:  'lilac'  | 'neutral'     overrides ambient context
 *   disabled?: boolean
 *   onPress?: () => void
 *   children: string (label only — no slot for icons; Button is text-only today)
 *
 * ⚠ DRIFT (logged · roadmap/N+12b.md): the web Button ALSO ships a
 * `size` prop (sm | md | lg · button.js ATTRS · button.ts emits the
 * lg/md/sm MinHeight/PaddingX/Radius triples + decision 55 couples the
 * label type: sm → type-sm-em, md/lg → type-md-em). This RN mirror is
 * md-LOCKED — it resolves only the `md*` token triple and the mdEm
 * label. Adding `size` is faithful to the web API and uses already-
 * emitted tokens, but couples label typography to size; logged as an
 * OPEN decision rather than silently expanding the split's scope.
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
  AccentContext,
  ThemeContext,
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
  type RuntimeTokens,
} from './_shared';

export type ButtonProps = {
  variant?: 'solid' | 'soft';
  accent?: Accent;
  disabled?: boolean;
  onPress?: () => void;
  children: string;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'soft',
  accent: accentProp,
  disabled,
  onPress,
  children,
}) => {
  // Tier 2 self-scope · `accent` prop wins over ambient context.
  // Mirrors button.js #sync: if prop set, mirror to data-accent on
  // the inner button; if absent, inherit. Here we read context as
  // the inherit path.
  const ambientAccent = React.useContext(AccentContext);
  const accent: Accent = accentProp ?? ambientAccent;

  const theme = React.useContext(ThemeContext);

  // N+6.1 consumer-side static-vs-dynamic split (decision 36 ·
  // amendment 36.1 · N+6.1.1): `minHeight` + `paddingHorizontal` +
  // `borderRadius` all reference runtime sets (size / space / radius),
  // so their values aren't known at module load and can't live in
  // StyleSheet.create. Resolve at render time through resolveToken
  // against the live `tokens` slice.
  const tokens: RuntimeTokens = {
    chrome: chrome[theme],
    accent: accentTokens[accent][theme],
    space,
    size,
    radius,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight:         resolveToken(tokens, button.mdMinHeight) as number,
          paddingHorizontal: resolveToken(tokens, button.mdPaddingX)  as number,
          borderRadius:      resolveToken(tokens, button.mdRadius)    as number,
        },
        variantStyle(variant, accent, theme, pressed),
        pressed && !disabled && { transform: [{ scale: button.pressScale }] },
        disabled && { opacity: button.disabledOpacity },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: labelColor(variant, accent, theme) },
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

// Button-internal base + label styling. radius/minHeight/paddingX are
// runtime-set leaves resolved inline (above), so only the geometry-
// invariant flex bits live in the static sheet. Label type sources from
// the shared scale (decision 54/55) — Button is md-only here → mdEm.
const styles = StyleSheet.create({
  base: {
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'row',
    flex:           1,
  },
  label: {
    ...typeStyle('mdEm'),
  },
});
