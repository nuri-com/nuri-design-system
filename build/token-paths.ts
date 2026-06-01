/* ──────────────────────────────────────────────────────────────
 * NURI · TOKEN PATHS · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · build/tokens.ts (every runtime-set leaf path)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * Discriminated union of every runtime-set leaf path. Consumed
 * by build/components/<name>.ts where each TokenPath string is
 * `as const satisfies TokenPath`-checked, so adding or
 * renaming a runtime leaf without re-emitting this union fails
 * the TS compile (decision 34 · N+6.0.3).
 * ────────────────────────────────────────────────────────────── */

export type TokenPath =
  | 'chrome.bgCanvas'
  | 'chrome.bgSubtle'
  | 'chrome.bgStrong'
  | 'chrome.bgPressed'
  | 'chrome.bgInverse'
  | 'chrome.bgInverseMuted'
  | 'chrome.textPrimary'
  | 'chrome.textMuted'
  | 'chrome.textOnInverse'
  | 'chrome.borderSubtle'
  | 'chrome.borderDefault'
  | 'chrome.borderStrong'
  | 'chrome.focusRing'
  | 'accent.fg'
  | 'accent.solid'
  | 'accent.solidPressed'
  | 'accent.onSolid'
  | 'accent.bgSubtle'
  | 'accent.bgSubtlePressed'
  | 'space.none'
  | 'space.2xs'
  | 'space.xs'
  | 'space.sm'
  | 'space.md'
  | 'space.lg'
  | 'space.xl'
  | 'space.2xl'
  | 'size.xs'
  | 'size.sm'
  | 'size.md'
  | 'size.lg'
  | 'size.xl'
  | 'size.2xl'
  | 'size.3xl'
  | 'radius.sm'
  | 'radius.md'
  | 'radius.lg'
  | 'radius.full';
