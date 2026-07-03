/* ══════════════════════════════════════════════════════════════════
 * NURI · RUNTIME · THE RESOLVED THEME PAYLOAD (Option B · SEED-4)
 * ──────────────────────────────────────────────────────────────────
 * The transversal colour baseline (resolver-model §1 · "four small, fixed,
 * centralised vocabularies": colour · type · geometry · interaction),
 * RESOLVED per (accent × mode) into the §11 theme shape so the RN team's
 * later Unistyles adoption is a SWAP, not a rewrite (decision 7 · resolver-
 * model §7). This is the SINGLE colour-resolution point — the provider
 * (theme.tsx) builds the payload ONCE per address and hands it down via
 * context (Option B · the decision-79 "materialize · runtime SELECTS the
 * slice" restored for colour · debt-register SEED-4). NO per-component
 * rebuild; NO per-render re-collapse.
 *
 *   surface   { solid·soft·ghost·subtle·outline } → { bg?·fg·fgMuted?·pressedBg?·border? }
 *   chrome    { canvas·subtle·strong·transparent } → { bg·fg·fgMuted }  (theme-only slot)
 *   text·border                            (the chrome text/border roles)
 *   type                                  (theme-invariant type scale)
 *   interaction { pressScale·disabledOpacity }   (the not-colour effects)
 *
 * The colour half is BUILT FROM THE FROZEN palette mapping (generated/
 * palette.ts · the {variant|chrome} → colour-REF data · decision 65.1/65.2).
 * The mapping preserves `(group, leaf)` STRUCTURALLY (a `ColorRef`), so the
 * builder indexes the selected slice with ZERO parse — the old stringly
 * `resolveColor` dot-sniff + `RUNTIME_GROUPS` restatement dissolved (SEED-4).
 * The two colour axes stay ORTHOGONAL (chrome[mode] + accent[accent][mode] ·
 * NO cross-product): this file SELECTS both slices, then applies the global
 * variant→role mapping ONCE — the "baseline is theme/factory-owned, NOT in
 * the descriptor" split (§7).
 * ══════════════════════════════════════════════════════════════════ */

import {
  typeScale,
  interaction,
} from '../contract';
import type {
  Accent,
  Theme,
  PaletteVariant,
  PaletteChrome,
} from '../contract';
// The palette MAPPING is an INTERNAL engine detail (not part of the public
// contract seam · SEED-4) — imported straight from generated/, so it never
// reaches the public barrel via contract.ts.
import { palette } from '../generated/data/palette';
import { chrome, accent as accentTokens } from '../generated/data/tokens';

// ── ChromeSlice · the raw chrome roles for ONE mode (chrome[mode]) ──
type ChromeSlice = typeof chrome.light;

// ── AccentSlice · the accent roles collapsed to ONE mode's concrete hex ──
// The colour SoT is accent-MAJOR two-layer (N+59 · projection model §3):
// `accentTokens[accent]` is a role table whose every role is a flat hex
// (theme-invariant · the P4-frozen brand fill) OR a `{light,dark}` pair
// (theme-adapting). The live slice collapses each role to its mode-concrete hex
// — BYTE-IDENTICAL to the value the old `accentTokens[accent][mode]` cross-
// product cell carried. The collapse runs ONCE per address (in buildNuriTheme),
// never per render (the old `resolveAccentSlice`/`runtimeTokens` per-render role
// is gone · SEED-4).
type AccentTable = (typeof accentTokens)[Accent];
export type AccentSlice = { [K in keyof AccentTable]: string };

// ── Resolved roles (the §11 shapes) ──────────────────────────────
// `bg` is optional: the frozen `subtle` role is fg-ONLY (palette.ts ·
// "no bg/pressed · the IconAvatar role"); `ghost` carries the literal
// 'transparent'. A consumer treats an absent bg as "no fill".
export type SurfaceRole = {
  bg?: string;
  fg: string;
  fgMuted?: string;
  pressedBg?: string;
  border?: string;
};
export type ChromeRole = { bg: string; fg: string; fgMuted: string };

// NuriTheme · the RESOLVED colour theme (the variant→role mapping applied). The
// PRIMARY factory read: `theme.surface[variant]` / `theme.chrome[slot]`. Kept as
// the typed shape the factory consumes (SEED-4: it is the payload's resolved
// half, no longer a per-component rebuild).
export type NuriTheme = {
  surface: Record<PaletteVariant, SurfaceRole>;
  chrome: Record<PaletteChrome, ChromeRole>;
  text: { primary: string; muted: string; onInverse: string };
  border: { subtle: string; default: string; strong: string };
  type: typeof typeScale;
  interaction: { pressScale: number; disabledOpacity: number };
};

// ThemePayload · the CONTEXT VALUE the provider builds ONCE per address
// (Option B · Address + Payload). The Address (`mode`/`accent` scalars ·
// orthogonal single-axis override — a nested scope flips one axis, inherits
// the other) + the resolved NuriTheme roles.
export type ThemePayload = NuriTheme & {
  mode: Theme;
  accent: Accent;
};

// ── The interaction baseline (resolver-model §1 · the not-colour effects) ──
// The frozen build emits a TRANSVERSAL interaction artifact (generated/
// interaction.ts = { pressScale: 0.97, disabledOpacity: 0.4 }); the factory
// reads it directly and pins to it (asserted in the faithfulness test) so it
// cannot drift.
export const INTERACTION_BASELINE: { pressScale: number; disabledOpacity: number } = {
  pressScale: interaction.pressScale,
  disabledOpacity: interaction.disabledOpacity,
};

// A palette mapping cell: a structural colour REF `{ group, leaf }` (indexed
// against the selected chrome | accent slice · ZERO parse) or a verbatim literal
// (ghost's 'transparent'). This replaces the old `resolveColor` dot-sniff +
// `RUNTIME_GROUPS` — the (group, leaf) is preserved by the emit (SEED-4).
type ColorRef = { group: 'chrome' | 'accent'; leaf: string };

// bindColor · a cell → its concrete hex. A literal string is used verbatim; a
// ref indexes its group's slice (chrome[mode] | the accent slice) by leaf.
function bindColor(cell: unknown, chromeSlice: ChromeSlice, accentSlice: AccentSlice): string | undefined {
  if (cell === undefined) return undefined;
  if (typeof cell === 'string') return cell; // literal (e.g. 'transparent')
  const ref = cell as ColorRef;
  const slice = ref.group === 'chrome' ? (chromeSlice as Record<string, string>) : (accentSlice as Record<string, string>);
  return slice[ref.leaf];
}

function buildSurface(chromeSlice: ChromeSlice, accentSlice: AccentSlice): Record<PaletteVariant, SurfaceRole> {
  const out = {} as Record<PaletteVariant, SurfaceRole>;
  (Object.keys(palette.variant) as PaletteVariant[]).forEach((variant) => {
    const cell = palette.variant[variant] as Record<string, unknown>;
    out[variant] = {
      bg: bindColor(cell.bg, chromeSlice, accentSlice),
      fg: bindColor(cell.fg, chromeSlice, accentSlice) as string,
      fgMuted: bindColor(cell.fgMuted, chromeSlice, accentSlice),
      pressedBg: bindColor(cell.pressedBg, chromeSlice, accentSlice),
      border: bindColor(cell.border, chromeSlice, accentSlice),
    };
  });
  return out;
}

function buildChrome(chromeSlice: ChromeSlice, accentSlice: AccentSlice): Record<PaletteChrome, ChromeRole> {
  const out = {} as Record<PaletteChrome, ChromeRole>;
  (Object.keys(palette.chrome) as PaletteChrome[]).forEach((slot) => {
    const cell = palette.chrome[slot] as Record<string, unknown>;
    out[slot] = {
      bg: bindColor(cell.bg, chromeSlice, accentSlice) as string,
      fg: bindColor(cell.fg, chromeSlice, accentSlice) as string,
      fgMuted: bindColor(cell.fgMuted, chromeSlice, accentSlice) as string,
    };
  });
  return out;
}

// buildNuriTheme · (accent × mode) → the resolved ThemePayload. PURE; the
// provider/scope memoise it per address (theme.tsx), and the resolution tests
// (resolve.test.ts · geometry-bake.test.ts) call it directly. The two
// orthogonal slices are SELECTED here
// (chrome[mode] + the collapsed accent slice), then the global variant→role
// mapping is applied ONCE — the whole colour ceremony, run a single time per
// address instead of per component / per render.
export function buildNuriTheme(accent: Accent, mode: Theme): ThemePayload {
  const chromeSlice = chrome[mode];

  // Collapse the two-layer accent table to this mode's concrete slice (was
  // `resolveAccentSlice` · inlined · the ONE place the per-mode collapse runs).
  const table = accentTokens[accent];
  const accentSlice = {} as Record<string, string>;
  for (const role in table) {
    const v = table[role as keyof AccentTable] as string | { light: string; dark: string };
    accentSlice[role] = typeof v === 'string' ? v : v[mode];
  }
  const acc = accentSlice as AccentSlice;

  return {
    mode,
    accent,
    surface: buildSurface(chromeSlice, acc),
    chrome: buildChrome(chromeSlice, acc),
    text: {
      primary: chromeSlice.textPrimary,
      muted: chromeSlice.textMuted,
      onInverse: chromeSlice.textOnInverse,
    },
    border: {
      subtle: chromeSlice.borderSubtle,
      default: chromeSlice.borderDefault,
      strong: chromeSlice.borderStrong,
    },
    type: typeScale,
    interaction: INTERACTION_BASELINE,
  };
}
