/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · THE BASELINE THEME (Unistyles-SHAPED · resolver-model §11)
 * ──────────────────────────────────────────────────────────────────
 * The transversal baseline (resolver-model §1 · "four small, fixed,
 * centralised vocabularies": colour · type · geometry · interaction),
 * RESOLVED per (accent × mode) into the exact §11 theme shape so the RN
 * team's later Unistyles adoption is a SWAP, not a rewrite (decision 7 ·
 * Unistyles-compatible, NOT a dependency · resolver-model §7).
 *
 *   surface   { solid·soft·ghost·subtle } → { bg?·fg·fgMuted?·pressedBg? }
 *   chrome    { canvas·subtle·strong }     → { bg·fg·fgMuted }  (theme-only slot)
 *   text·border                            (the chrome text/border roles)
 *   type·space·size·radius                 (theme-invariant scales)
 *   interaction { pressScale·disabledOpacity }   (the not-colour effects)
 *
 * The colour half is BUILT FROM THE FROZEN palette mapping (build/palette.ts ·
 * the {variant|chrome} → TokenPath data · decision 65.1/65.2) dereferenced
 * against the live slice via the existing `resolveToken` — we REUSE the
 * consumer's token resolution (theme.tsx), never reinvent it. This is the
 * "baseline is theme/factory-owned, NOT in the descriptor" split (§7): the
 * descriptor names `palette.variant: 'solid'`; THIS file knows solid → bg/fg.
 * ══════════════════════════════════════════════════════════════════ */

import {
  palette,
  space,
  size,
  radius,
  typeScale,
  button,
} from '../contract';
import type {
  Accent,
  Theme,
  PaletteVariant,
  PaletteChrome,
  TokenPath,
} from '../contract';
import { runtimeTokens, resolveToken } from '../theme';
import type { RuntimeTokens } from '../theme';

// ── Resolved roles (the §11 shapes) ──────────────────────────────
// `bg` is optional: the frozen `subtle` role is fg-ONLY (palette.ts ·
// "no bg/pressed · the IconAvatar role"); `ghost` carries the literal
// 'transparent'. A consumer treats an absent bg as "no fill".
export type SurfaceRole = {
  bg?: string;
  fg: string;
  fgMuted?: string;
  pressedBg?: string;
};
export type ChromeRole = { bg: string; fg: string; fgMuted: string };

export type NuriTheme = {
  surface: Record<PaletteVariant, SurfaceRole>;
  chrome: Record<PaletteChrome, ChromeRole>;
  text: { primary: string; muted: string; onInverse: string };
  border: { subtle: string; default: string; strong: string };
  type: typeof typeScale;
  space: typeof space;
  size: typeof size;
  radius: typeof radius;
  interaction: { pressScale: number; disabledOpacity: number };
};

// ── The interaction baseline (resolver-model §1 · the not-colour effects) ──
// CONTRACT FINDING (R1): the frozen build emits NO transversal interaction
// artifact — `pressScale`/`disabledOpacity` are embedded per-component
// (build/components/{button,icon-button}.ts = 0.97 / 0.4). Per resolver-model
// §1/§7/§11 the interaction baseline is TRANSVERSAL (theme/factory-owned, NOT
// descriptor data), so the factory carries it here. The values are PINNED to
// the contract's embedded numerics by `button.pressScale`/`disabledOpacity`
// below (and asserted in the faithfulness test) so they cannot silently drift.
export const INTERACTION_BASELINE: { pressScale: number; disabledOpacity: number } = {
  pressScale: button.pressScale,
  disabledOpacity: button.disabledOpacity,
};

// The runtime-set groups a TokenPath can address (build/token-paths.ts).
// A palette value that is NOT a `group.leaf` path (e.g. ghost's literal
// 'transparent') is used verbatim.
const RUNTIME_GROUPS = new Set(['chrome', 'accent', 'space', 'size', 'radius']);

function resolveColor(slice: RuntimeTokens, value: string): string {
  const dot = value.indexOf('.');
  if (dot > 0 && RUNTIME_GROUPS.has(value.slice(0, dot))) {
    return resolveToken(slice, value as TokenPath) as string;
  }
  return value; // literal (e.g. 'transparent')
}

// A palette mapping cell, read uniformly (the frozen entries are
// heterogeneous: subtle is fg-only, solid has no fgMuted, …).
type PaletteCell = Partial<Record<'bg' | 'fg' | 'fgMuted' | 'pressedBg', string>>;

function buildSurface(slice: RuntimeTokens): Record<PaletteVariant, SurfaceRole> {
  const out = {} as Record<PaletteVariant, SurfaceRole>;
  (Object.keys(palette.variant) as PaletteVariant[]).forEach((variant) => {
    const cell = palette.variant[variant] as PaletteCell;
    out[variant] = {
      bg: cell.bg !== undefined ? resolveColor(slice, cell.bg) : undefined,
      fg: resolveColor(slice, cell.fg as string),
      fgMuted: cell.fgMuted !== undefined ? resolveColor(slice, cell.fgMuted) : undefined,
      pressedBg: cell.pressedBg !== undefined ? resolveColor(slice, cell.pressedBg) : undefined,
    };
  });
  return out;
}

function buildChrome(slice: RuntimeTokens): Record<PaletteChrome, ChromeRole> {
  const out = {} as Record<PaletteChrome, ChromeRole>;
  (Object.keys(palette.chrome) as PaletteChrome[]).forEach((slot) => {
    const cell = palette.chrome[slot] as PaletteCell;
    out[slot] = {
      bg: resolveColor(slice, cell.bg as string),
      fg: resolveColor(slice, cell.fg as string),
      fgMuted: resolveColor(slice, cell.fgMuted as string),
    };
  });
  return out;
}

// buildNuriTheme · (accent × mode) → the resolved §11 baseline theme.
// Pure; the React factory memoises it by (accent, mode).
export function buildNuriTheme(accent: Accent, mode: Theme): NuriTheme {
  const slice = runtimeTokens(accent, mode);
  return {
    surface: buildSurface(slice),
    chrome: buildChrome(slice),
    text: {
      primary: resolveToken(slice, 'chrome.textPrimary') as string,
      muted: resolveToken(slice, 'chrome.textMuted') as string,
      onInverse: resolveToken(slice, 'chrome.textOnInverse') as string,
    },
    border: {
      subtle: resolveToken(slice, 'chrome.borderSubtle') as string,
      default: resolveToken(slice, 'chrome.borderDefault') as string,
      strong: resolveToken(slice, 'chrome.borderStrong') as string,
    },
    type: typeScale,
    space,
    size,
    radius,
    interaction: INTERACTION_BASELINE,
  };
}
