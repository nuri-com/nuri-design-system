/* ══════════════════════════════════════════════════════════════════
 * ICON-BUTTON · the RN side of <nuri-icon-button> · N+6.4 · N+6.8
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors icon-button.js (the web custom-element):
 *   name:      IconName  (registry key · the typed union from build/icons)
 *   variant?:  'solid' | 'soft' | 'ghost'   default 'soft' (decision 39 adds ghost)
 *   accent?:   Accent                       overrides ambient context
 *   disabled?: boolean
 *   label?:    string  (explicit a11y name; else derived from `name` · F-ARIA-LABEL-1)
 *   onPress?:  () => void
 *   fill?:     boolean  (selects the filled glyph weight · amendment 40.1)
 *   — NO `size` prop · single-size-locked md=48px (decision 40)
 *   — NO text children · icon-only
 *
 * The glyph is a real composed <Icon> over the shared registry
 * (F-ICON-RN-1 CLOSED · N+6.8 · decision 48).
 *
 * TOKEN SOURCING (D4 · N+13 · decision 52 EMIT-not-hardcode): geometry
 * now DEREFERENCES the emitted `build/components/icon-button.ts`
 * (iconButton.size = 'size.lg', iconButton.radius = 'radius.full')
 * through resolveToken rather than hardcoding size.lg / radius.full.
 * Values are unchanged — this is the value-neutral cleanup N+12b logged.
 * The variant COLOUR funnel still reuses the shared `button.*` tokens by
 * design (the decision 39/40 funnel the web .nuri-icon-button shares
 * with .nuri-button) — D4 touches only the geometry sourcing.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable } from 'react-native';
import { Icon } from './icon';
import {
  NuriThemeContext,
  resolveToken,
  button,
  iconButton,
  chrome,
  accentTokens,
  space,
  size,
  radius,
  type Accent,
  type Theme,
  type IconName,
  type RuntimeTokens,
} from './_shared';

export type IconButtonProps = {
  name: IconName;
  variant?: 'solid' | 'soft' | 'ghost';
  accent?: Accent;
  disabled?: boolean;
  label?: string;
  onPress?: () => void;
  fill?: boolean;
};

// Ghost extends the variant→bg map with a chrome-only, accent-invariant
// transparent rest state (decision 39). `ghostBg` emits as the literal
// string 'transparent' (NOT a TokenPath), so it bypasses resolveToken.
export function iconButtonBg(
  variant: NonNullable<IconButtonProps['variant']>,
  accent: Accent,
  theme: Theme,
  pressed: boolean,
): string {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  if (variant === 'ghost') {
    // rest = transparent literal; pressed = chrome subtle wash.
    return pressed ? (resolveToken(tokens, button.ghostBgPressed) as string) : button.ghostBg;
  }
  if (variant === 'solid') {
    return resolveToken(tokens, pressed ? button.solidBgPressed : button.solidBg) as string;
  }
  return resolveToken(tokens, pressed ? button.softBgPressed : button.softBg) as string;
}

// Glyph colour per variant — the foreground twin of iconButtonBg, reusing
// the button.*Fg tokens (the same funnel the web shares · decision 39/40).
// solid → accent.onSolid; soft/ghost → chrome.textPrimary. Fed to Icon's
// `color` (its currentColor channel).
export function iconButtonFg(
  variant: NonNullable<IconButtonProps['variant']>,
  accent: Accent,
  theme: Theme,
): string {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  if (variant === 'solid') return resolveToken(tokens, button.solidFg) as string;
  if (variant === 'ghost') return resolveToken(tokens, button.ghostFg) as string;
  return resolveToken(tokens, button.softFg) as string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  variant = 'soft',
  accent: accentProp,
  disabled,
  label,
  onPress,
  fill,
}) => {
  const { mode, accent: ambientAccent } = React.useContext(NuriThemeContext);
  const accent: Accent = accentProp ?? ambientAccent;

  // Single-size-locked md (decision 40): the circular hit area + radius
  // dereference the emitted iconButton.size / .radius (D4 · decision 52).
  // size/radius are cascade-invariant, so the slice's accent/mode don't
  // affect the result — but we resolve through the standard funnel anyway.
  const geomTokens: RuntimeTokens = {
    chrome: chrome[mode], accent: accentTokens[accent][mode], space, size, radius,
  };
  const dimension    = resolveToken(geomTokens, iconButton.size)   as number; // 48px (size.lg)
  const borderRadius = resolveToken(geomTokens, iconButton.radius) as number; // 9999 (radius.full)

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      // F-ARIA-LABEL-1 · icon-only ⇒ an accessible name is REQUIRED.
      // Explicit `label` wins; else derive from the kebab `name`.
      accessibilityLabel={label ?? name.replace(/-/g, ' ')}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        {
          width:           dimension,
          height:          dimension,
          borderRadius,
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: iconButtonBg(variant, accent, mode, pressed),
        },
        pressed && !disabled && { transform: [{ scale: button.pressScale }] },
        disabled && { opacity: button.disabledOpacity },
      ]}
    >
      <Icon name={name} fill={fill} color={iconButtonFg(variant, accent, mode)} />
    </Pressable>
  );
};
