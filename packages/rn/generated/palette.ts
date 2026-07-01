/* ──────────────────────────────────────────────────────────────
 * NURI · PALETTE MAPPING · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · the namespace axis TS SoTs (asserted cell-for-cell at
 * emit time — a contradiction fails the build · decision 48):
 *   pipeline/palette-surface.ts   every variant + chrome bg/fg pair
 *                                 (+ the pressed swap → pressedBg)
 *   pipeline/typography-axis.ts   the muted dispatch → the muted fg (fgMuted)
 * (Re-sourced at N+40 from the generated lib/components/{palette,typography}.css
 *  these SoTs emit · §74 'Next: final' — the spec build stops reading the namespace
 *  CSS the A3 carve relocates · build/palette.ts cells unchanged.)
 * Emitter · pipeline/parsers/palette.js — run `npm run build`
 *
 * The {variant | chrome} → {bg · fg · fgMuted · pressedBg} mapping as
 * STRUCTURAL colour REFS (decision 34 · SEED-4) — accent×theme-GENERIC. Each
 * cell is `{ group, leaf }` preserving the (group, leaf) so the RN theme
 * builder (generated → factory/theme.ts) indexes the selected chrome | accent
 * slice with ZERO parse (the old dotted-string + resolveColor dot-sniff is
 * gone). The mapping is applied ONCE at the provider (Option B · 65.1: engine =
 * platform-native, mapping = data · emitted ONCE · 65.2).
 *
 *   · ghost.bg = the literal 'transparent' (NOT a ref) — the
 *     build/components/button.ts ghostBg convention.
 *   · subtle = fg-only (no bg/pressed) · the IconAvatar role.
 *   · chrome = theme-only surfaces (no accent, no pressed).
 *   · pressedBg is DATA for the RN resolver; the web pressed
 *     dispatch is gated on the `interactive` flag (B2c).
 *   · RESERVED — mapped, not built (decision 30): variant 'outline'
 *     · the border channel · solid.fgMuted (the onSolid.muted token).
 * ────────────────────────────────────────────────────────────── */

import type { TokenPath } from './token-paths';

// A colour cell is a structural REF — `{ group, leaf }` preserved so the theme
// builder indexes the selected (chrome | accent) slice with ZERO parse — or a
// verbatim literal (ghost's 'transparent'). `ColorRef` pins each ref's
// `${group}.${leaf}` to a real runtime TokenPath (the emit-time guarantee, typed).
export type ColorRef<P extends TokenPath = TokenPath> =
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
  },
} as const;
