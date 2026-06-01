/* ══════════════════════════════════════════════════════════════════
 * ICON-AVATAR · the RN side of <nuri-icon-avatar> · N+6.9 · decision 50
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors icon-avatar.js (the web custom-element):
 *   name:     IconName  (registry key · the typed union from build/icons)
 *   variant?: 'solid' | 'soft' | 'ghost' | 'subtle'   default 'soft'
 *   accent?:  Accent                       overrides ambient context
 *   fill?:    boolean
 *   — NO disabled / label / onPress · NO size prop (single-locked)
 *
 * The static, DECORATIVE twin of IconButton: a circular View filled per
 * the SAME variant→surface map IconButton uses for solid/soft/ghost,
 * REST state only (no pressed/disabled). Those three reuse the
 * iconButtonBg/iconButtonFg funnel — proving "same resolveToken surface"
 * literally, not by copy. IconAvatar ALSO carries an avatar-only `subtle`
 * variant (transparent bg · glyph in chrome.borderStrong) with no
 * IconButton counterpart — an actionable control never wants a
 * near-invisible glyph (decision 50). Composes the real Icon: IconAvatar
 * is the FIRST NEW consumer to ship against the resolved Icon
 * (F-ICON-RN-1 closed · N+6.8 · decision 48), no shim. Single-size-locked
 * size.lg (48px) circle · size="md" (28px) glyph — IconAvatar mirrors
 * IconButton's geometry leaf-for-leaf (its exact twin).
 *
 * Decorative ⇒ hidden from AT entirely (accessibilityElementsHidden +
 * importantForAccessibility). There is NO accessible name to derive —
 * the adjacent text label is the content (contrast IconButton's
 * F-ARIA-LABEL-1 · decision 50).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View } from 'react-native';
import { Icon } from './icon';
import { iconButtonBg, iconButtonFg } from './icon-button';
import {
  NuriThemeContext,
  resolveToken,
  chrome,
  accentTokens,
  space,
  size,
  radius,
  type Accent,
  type TokenPath,
  type RuntimeTokens,
  type IconName,
} from './_shared';

export type IconAvatarVariant = 'solid' | 'soft' | 'ghost' | 'subtle';

export type IconAvatarProps = {
  name: IconName;
  variant?: IconAvatarVariant;
  accent?: Accent;
  fill?: boolean;
};

export const IconAvatar: React.FC<IconAvatarProps> = ({
  name,
  variant = 'soft',
  accent: accentProp,
  fill,
}) => {
  const { mode, accent: ambientAccent } = React.useContext(NuriThemeContext);
  const accent: Accent = accentProp ?? ambientAccent;

  // solid/soft/ghost reuse IconButton's REST-state funnel (pressed=false)
  // so the shared matrix can never drift. `subtle` is avatar-only:
  // transparent surface, glyph painted in chrome.borderStrong (the same
  // semantic the web .nuri-icon-avatar--subtle consumes).
  const bg = variant === 'subtle' ? 'transparent' : iconButtonBg(variant, accent, mode, false);
  const fg = variant === 'subtle' ? chrome[mode].borderStrong : iconButtonFg(variant, accent, mode);

  // Geometry dereferences the SHARED semantic scale (size.lg / radius.full)
  // through resolveToken — mirroring the web .nuri-icon-avatar, which consumes
  // var(--nuri-size-lg)/var(--nuri-radius-full) DIRECTLY and deliberately does
  // NOT alias icon-button's tokens (icon-avatar.css :37-40,:46-50 · decision 50:
  // IconAvatar skip-emits, so it has no component token of its own). This is the
  // single-size lock (48px / full) — the same semantic leaves IconButton resolves,
  // sourced from the shared scale rather than coupling to iconButton.*. Cascade-
  // invariant, so the slice's accent/mode don't affect the result.
  const geomTokens: RuntimeTokens = {
    chrome: chrome[mode], accent: accentTokens[accent][mode], space, size, radius,
  };
  const dimension    = resolveToken(geomTokens, 'size.lg'     as TokenPath) as number; // 48px
  const borderRadius = resolveToken(geomTokens, 'radius.full' as TokenPath) as number; // 9999

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width:           dimension,
        height:          dimension,
        borderRadius,
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: bg,
      }}
    >
      <Icon name={name} size="md" fill={fill} color={fg} />
    </View>
  );
};
