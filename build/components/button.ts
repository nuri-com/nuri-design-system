/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT TOKENS · BUTTON · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · lib/components/button/button.css @layer tokens
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * Per the set-policy registry (decision 34 · N+6.0.3):
 *   · Literal numerics/strings = references through pipeline-
 *     inlined primitive sets (px · radius · type · font · …)
 *     resolved to terminal literals at build time.
 *   · TokenPath strings = references through runtime sets
 *     (chrome · accent); the consumer dereferences via a
 *     resolveToken(tokens, path) helper at render time.
 * ────────────────────────────────────────────────────────────── */

import type { TokenPath } from '../token-paths';

export const button = {
  pressScale:       0.97,
  disabledOpacity:  0.4,
  lgMinHeight:      'size.xl'             as const satisfies TokenPath,
  lgPaddingX:       'space.xl'            as const satisfies TokenPath,
  lgRadius:         'radius.md'           as const satisfies TokenPath,
  mdMinHeight:      'size.lg'             as const satisfies TokenPath,
  mdPaddingX:       'space.lg'            as const satisfies TokenPath,
  mdRadius:         'radius.sm'           as const satisfies TokenPath,
  smMinHeight:      'size.md'             as const satisfies TokenPath,
  smPaddingX:       'space.md'            as const satisfies TokenPath,
  smRadius:         'radius.sm'           as const satisfies TokenPath,
  solidBg:          'accent.solid'        as const satisfies TokenPath,
  solidBgPressed:   'accent.solidPressed' as const satisfies TokenPath,
  solidFg:          'accent.onSolid'      as const satisfies TokenPath,
  softBg:           'chrome.bgStrong'     as const satisfies TokenPath,
  softBgPressed:    'chrome.bgPressed'    as const satisfies TokenPath,
  softFg:           'chrome.textPrimary'  as const satisfies TokenPath,
  ghostBg:          'transparent',
  ghostBgPressed:   'chrome.bgSubtle'     as const satisfies TokenPath,
  ghostFg:          'chrome.textPrimary'  as const satisfies TokenPath,
} as const;
