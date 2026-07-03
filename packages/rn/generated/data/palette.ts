/* ──────────────────────────────────────────────────────────────
 * NURI · PALETTE MAPPING · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · the namespace axis TS SoTs (asserted cell-for-cell at
 * emit time — a contradiction fails the build · decision 48):
 *   packages/spec/axes/palette-surface.ts   every variant + chrome bg/fg pair
 *                                 (+ the pressed swap → pressedBg)
 *   packages/spec/axes/typography-axis.ts   the muted role → the muted fg (fgMuted)
 * (Re-sourced at N+40 from the generated prototype namespace CSS these SoTs emit
 *  · §74 'Next: final' — the spec build stops reading projection CSS.)
 * Emitter · scripts/parsers/palette.js — run `npm run build`
 *
 * The {variant | chrome} → {bg · fg · fgMuted · pressedBg · border} mapping as
 * STRUCTURAL colour REFS (decision 34 · SEED-4) — accent×theme-GENERIC. Each
 * cell is `{ group, leaf }` preserving the (group, leaf) so the RN theme
 * builder (generated → runtime/theme-payload.ts) indexes the selected chrome | accent
 * slice with ZERO parse (the old dotted-string + resolveColor dot-sniff is
 * gone). The mapping is applied ONCE at the provider (Option B · 65.1: engine =
 * platform-native, mapping = data · emitted ONCE · 65.2).
 *
 *   · ghost.bg = the literal 'transparent' (NOT a ref) — the
 *     retired per-component button ghostBg convention.
 *   · subtle = fg-only (no bg/pressed) · the IconAvatar role.
 *   · chrome = theme-only surfaces (no accent, no pressed).
 *   · pressedBg is DATA for the RN resolver; the web pressed
 *     dispatch is gated on the `interactive` flag (B2c).
 *   · outline.border carries the border-colour role for outlined surfaces.
 *   · RESERVED — mapped, not built (decision 30): solid.fgMuted
 *     (the onSolid.muted token).
 * ────────────────────────────────────────────────────────────── */

import type { TokenPath } from './token-paths';

// A colour cell is a structural REF — `{ group, leaf }` preserved so the theme
// builder indexes the selected (chrome | accent) slice with ZERO parse — or a
// verbatim literal (ghost's 'transparent'). `ColorRef` is narrowed to the two
// COLOUR groups (chrome | accent · the only groups a palette cell refs) and pins
// each ref's `${group}.${leaf}` to a real runtime TokenPath (the emit guarantee).
type ColorPath = Extract<TokenPath, `chrome.${string}` | `accent.${string}`>;
export type ColorRef<P extends ColorPath = ColorPath> =
  P extends `${infer G}.${infer L}` ? { readonly group: G; readonly leaf: L } : never;

export const palette = {
  variant: {
    solid: {
      bg:         { group: 'accent', leaf: 'solid'        } as const satisfies ColorRef,
      fg:         { group: 'accent', leaf: 'onSolid'      } as const satisfies ColorRef,
      pressedBg:  { group: 'accent', leaf: 'solidPressed' } as const satisfies ColorRef,
    },
    soft: {
      bg:         { group: 'chrome', leaf: 'bgStrong'     } as const satisfies ColorRef,
      fg:         { group: 'chrome', leaf: 'textPrimary'  } as const satisfies ColorRef,
      fgMuted:    { group: 'chrome', leaf: 'textMuted'    } as const satisfies ColorRef,
      pressedBg:  { group: 'chrome', leaf: 'bgPressed'    } as const satisfies ColorRef,
    },
    ghost: {
      bg:         'transparent',
      fg:         { group: 'chrome', leaf: 'textPrimary'  } as const satisfies ColorRef,
      fgMuted:    { group: 'chrome', leaf: 'textMuted'    } as const satisfies ColorRef,
      pressedBg:  { group: 'chrome', leaf: 'bgSubtle'     } as const satisfies ColorRef,
    },
    subtle: {
      fg:         { group: 'chrome', leaf: 'borderStrong' } as const satisfies ColorRef,
    },
    outline: {
      bg:         'transparent',
      fg:         { group: 'chrome', leaf: 'textMuted'    } as const satisfies ColorRef,
      border:     { group: 'chrome', leaf: 'borderSubtle' } as const satisfies ColorRef,
    },
  },
  chrome: {
    canvas: {
      bg:         { group: 'chrome', leaf: 'bgCanvas'     } as const satisfies ColorRef,
      fg:         { group: 'chrome', leaf: 'textPrimary'  } as const satisfies ColorRef,
      fgMuted:    { group: 'chrome', leaf: 'textMuted'    } as const satisfies ColorRef,
    },
    subtle: {
      bg:         { group: 'chrome', leaf: 'bgSubtle'     } as const satisfies ColorRef,
      fg:         { group: 'chrome', leaf: 'textPrimary'  } as const satisfies ColorRef,
      fgMuted:    { group: 'chrome', leaf: 'textMuted'    } as const satisfies ColorRef,
    },
    strong: {
      bg:         { group: 'chrome', leaf: 'bgStrong'     } as const satisfies ColorRef,
      fg:         { group: 'chrome', leaf: 'textPrimary'  } as const satisfies ColorRef,
      fgMuted:    { group: 'chrome', leaf: 'textMuted'    } as const satisfies ColorRef,
    },
    transparent: {
      bg:         'transparent',
      fg:         { group: 'chrome', leaf: 'textPrimary'  } as const satisfies ColorRef,
      fgMuted:    { group: 'chrome', leaf: 'textMuted'    } as const satisfies ColorRef,
    },
  },
} as const;
