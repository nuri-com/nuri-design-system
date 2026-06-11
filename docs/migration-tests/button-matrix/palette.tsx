/* ══════════════════════════════════════════════════════════════════
 * PALETTE · the RN resolver of the colour namespace · N+19 B2b · 65.3 §6
 * ──────────────────────────────────────────────────────────────────
 * The platform-native ENGINE over the emitted MAPPING (decision 65.1:
 * engine = platform-native · mapping = data): resolvePalette dereferences
 * build/palette.ts — the {variant | chrome} → {bg, fg, fgMuted, pressedBg}
 * table, accent×theme-GENERIC TokenPaths — against the live (accent ×
 * theme) slice. The proven button/icon-button funnel (variantStyle ·
 * labelColor · iconButtonBg/Fg), generalized: same paths in, same
 * colours out; the per-component funnels now delegate here (P11 — the
 * existing mirrors are the engine's first consumers).
 *
 * THE CONTRACT (operator-settled · B2b): a palette surface resolves its
 * COMPLETE pair — bg AND fg — explicitly. No ambient fallback, no
 * inheritance semantics, no React context for fg (F-BOX-FG-1 is honored
 * by the CALLER passing the resolved fg to each part explicitly — never
 * by colour inheritance). At most ONE of `variant` | `chrome` per node.
 *
 *   · `accent` — tier-2 self-scope semantics: `ns.accent ?? ctx.accent`
 *     (the prop-wins merge every mirror already implements).
 *   · `pressed` — swaps bg → the row's pressedBg WHEN THE CELL EXISTS
 *     (subtle + the chrome slot have none by contract). State arrives
 *     from the caller (Pressable's render-prop); wiring it is the
 *     `interactive` flag's job (B2c), not the resolver's.
 *   · `muted` — carried in PaletteNS (the namespace shape · 65.3 §6) but
 *     NOT consumed here: muted is DELIVERED by Typography's existing
 *     muted dispatch (decision 53). The resolver returns the fgMuted
 *     CHANNEL; the consumer feeds it to the text part where needed.
 *   · ghost.bg = the literal 'transparent' (the ghostBg emit
 *     convention) — passes through resolveToken untouched.
 *   · RESERVED — mapped, not built (decision 30): variant 'outline' ·
 *     the `border` channel · solid.fgMuted (the onSolid.muted token).
 *     Reserved in comments only; no union member, no cell, no value.
 *
 * Typecheck-only (decision-65 Expo boundary): this drafts the engine the
 * Expo factory finalizes; it proves the emitted mapping is consumable.
 * ══════════════════════════════════════════════════════════════════ */

import {
  palette,
  resolveToken,
  chrome,
  accentTokens,
  space,
  size,
  radius,
  type Accent,
  type Theme,
  type TokenPath,
  type RuntimeTokens,
} from './_shared';

// 'outline' RESERVED (decision 30 · mapped-not-built) — joins the union
// with its first real consumer, never speculatively.
export type PaletteVariant = 'solid' | 'soft' | 'ghost' | 'subtle';
// The theme-only surface slot (B1.5 §4.3 · the `subtle` ROLE name is
// taken, hence a separate input axis).
export type PaletteChrome = 'canvas' | 'subtle' | 'strong';

// The palette namespace input (65.3 §6). At most one of variant|chrome
// per node (the recipes' authoring contract — not encoded in the type so
// the shape stays the model's literal `{ variant?, accent?, muted?,
// chrome? }`); `variant` wins deterministically if both arrive.
export type PaletteNS = {
  variant?: PaletteVariant;
  accent?: Accent;
  muted?: boolean;
  chrome?: PaletteChrome;
};

// The resolved channels. All optional: subtle is fg-only, an empty ns
// resolves to {}. `border` RESERVED (decision 30).
export type ResolvedPalette = {
  bg?: string;
  fg?: string;
  fgMuted?: string;
};

// A mapping cell: a TokenPath, or the 'transparent' literal (ghost.bg).
type PaletteCell = TokenPath | 'transparent';
// One mapping row, channel-optional (subtle has no bg; chrome rows have
// no pressedBg) — the widened view over build/palette.ts's const rows.
type PaletteRow = { bg?: PaletteCell; fg?: PaletteCell; fgMuted?: PaletteCell; pressedBg?: PaletteCell };

const resolveCell = (tokens: RuntimeTokens, cell: PaletteCell): string =>
  cell === 'transparent' ? cell : (resolveToken(tokens, cell) as string);

export function resolvePalette(
  ns: PaletteNS,
  ctx: { mode: Theme; accent: Accent },
  state: { pressed?: boolean } = {},
): ResolvedPalette {
  // Tier-2 self-scope: the node's own accent wins over the ambient one
  // (mirrors button.js #sync / the existing `accentProp ?? ambientAccent`).
  const accent: Accent = ns.accent ?? ctx.accent;
  const tokens: RuntimeTokens = {
    chrome: chrome[ctx.mode],
    accent: accentTokens[accent][ctx.mode],
    space,
    size,
    radius,
  };

  const row: PaletteRow | undefined = ns.variant
    ? palette.variant[ns.variant]
    : ns.chrome
      ? palette.chrome[ns.chrome]
      : undefined;
  if (!row) return {};

  // pressed → pressedBg, honored only where the cell exists (variant
  // rows minus subtle; the chrome slot has no pressed by contract).
  const bgCell = state.pressed && row.pressedBg !== undefined ? row.pressedBg : row.bg;

  return {
    bg:      bgCell      === undefined ? undefined : resolveCell(tokens, bgCell),
    fg:      row.fg      === undefined ? undefined : resolveCell(tokens, row.fg),
    fgMuted: row.fgMuted === undefined ? undefined : resolveCell(tokens, row.fgMuted),
  };
}
