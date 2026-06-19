/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT TOKENS · LIST-INTERACTIVE-ITEM · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · lib/components/list-interactive-item/list-interactive-item.css @layer tokens
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

export const listInteractiveItem = {
  wash:         'transparent',
  washPressed:  'chrome.bgSubtle' as const satisfies TokenPath,
  radius:       'radius.lg'       as const satisfies TokenPath,
} as const;
