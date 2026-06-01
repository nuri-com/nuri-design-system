/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT TOKENS · SWITCH · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · lib/components/switch/switch.css @layer tokens
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

export const switchTokens = {
  trackWidth:       'size.xl'               as const satisfies TokenPath,
  trackHeight:      'size.md'               as const satisfies TokenPath,
  knobSize:         'size.sm'               as const satisfies TokenPath,
  inset:            'space.xs'              as const satisfies TokenPath,
  trackOffBg:       'chrome.bgInverseMuted' as const satisfies TokenPath,
  trackOnBg:        'accent.solid'          as const satisfies TokenPath,
  knobBg:           'chrome.bgCanvas'       as const satisfies TokenPath,
  knobPressScale:   0.92,
  disabledOpacity:  0.4,
} as const;
