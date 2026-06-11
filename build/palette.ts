/* ──────────────────────────────────────────────────────────────
 * NURI · PALETTE MAPPING · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · the palette namespace's CSS SoT (asserted cell-for-cell
 * at emit time — a contradiction fails the build · decision 48):
 *   lib/components/palette/palette.css          every bg/fg cell
 *   lib/components/button/button.css            variant solid/soft/ghost
 *   lib/components/icon-avatar/icon-avatar.css  variant subtle (fg-only)
 *   lib/components/topbar/topbar.css            the chrome bg/fg pair
 *   lib/components/typography/typography.css    the muted fg (fgMuted)
 * Emitter · pipeline/parsers/palette.js — run `npm run build`
 *
 * The {variant | chrome} → {bg · fg · fgMuted · pressedBg} mapping
 * as TokenPath data (decision 34) — accent×theme-GENERIC; the
 * consumer dereferences each path against the live (accent × theme)
 * slice via resolveToken at render time (decision 65.1: engine =
 * platform-native, mapping = data · emitted ONCE · 65.2).
 *
 *   · ghost.bg = the literal 'transparent' (NOT a TokenPath) — the
 *     build/components/button.ts ghostBg convention.
 *   · subtle = fg-only (no bg/pressed) · the IconAvatar role.
 *   · chrome = theme-only surfaces (no accent, no pressed).
 *   · pressedBg is DATA for the RN resolver; the web pressed
 *     dispatch is gated on the `interactive` flag (B2c).
 *   · RESERVED — mapped, not built (decision 30): variant 'outline'
 *     · the border channel · solid.fgMuted (the onSolid.muted token).
 * ────────────────────────────────────────────────────────────── */

import type { TokenPath } from './token-paths';

export const palette = {
  variant: {
    solid: {
      bg:         'accent.solid'        as const satisfies TokenPath,
      fg:         'accent.onSolid'      as const satisfies TokenPath,
      pressedBg:  'accent.solidPressed' as const satisfies TokenPath,
    },
    soft: {
      bg:         'chrome.bgStrong'     as const satisfies TokenPath,
      fg:         'chrome.textPrimary'  as const satisfies TokenPath,
      fgMuted:    'chrome.textMuted'    as const satisfies TokenPath,
      pressedBg:  'chrome.bgPressed'    as const satisfies TokenPath,
    },
    ghost: {
      bg:         'transparent',
      fg:         'chrome.textPrimary'  as const satisfies TokenPath,
      fgMuted:    'chrome.textMuted'    as const satisfies TokenPath,
      pressedBg:  'chrome.bgSubtle'     as const satisfies TokenPath,
    },
    subtle: {
      fg:         'chrome.borderStrong' as const satisfies TokenPath,
    },
  },
  chrome: {
    canvas: {
      bg:         'chrome.bgCanvas'     as const satisfies TokenPath,
      fg:         'chrome.textPrimary'  as const satisfies TokenPath,
      fgMuted:    'chrome.textMuted'    as const satisfies TokenPath,
    },
    subtle: {
      bg:         'chrome.bgSubtle'     as const satisfies TokenPath,
      fg:         'chrome.textPrimary'  as const satisfies TokenPath,
      fgMuted:    'chrome.textMuted'    as const satisfies TokenPath,
    },
    strong: {
      bg:         'chrome.bgStrong'     as const satisfies TokenPath,
      fg:         'chrome.textPrimary'  as const satisfies TokenPath,
      fgMuted:    'chrome.textMuted'    as const satisfies TokenPath,
    },
  },
} as const;
