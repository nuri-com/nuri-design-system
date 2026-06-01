/* ══════════════════════════════════════════════════════════════════
 * TYPOGRAPHY · the RN side of <nuri-typography> · decision 53 (was N+6.7)
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors typography.js:
 *   Typography:
 *     size?:     'xs'|'sm'|'md'|'lg'|'xl'|'3xl'   default 'md'
 *     emphasis?: boolean                          regular → semibold
 *     muted?:    boolean                          text-primary → text-muted
 *     align?:    'start'|'center'|'end'           logical (mapped physical · F-TEXTALIGN-RTL)
 *     children:  the line
 *
 * Decision 53 ELIMINATED the former TypographyStackElement + its `level`
 * sub-scale: it collided with Typography's `size` and added indirection.
 * TypographyStack now wraps plain Typography lines whose size / emphasis
 * / muted carry the hierarchy (the 5-step scale was DROPPED, not replaced
 * by a guidance table — the author composes the props per line directly;
 * a hierarchy doctrine is deferred until the type-scale principles land).
 *
 * The size + weight metrics are dereferenced from the emitted `type`
 * namespace (build/tokens.ts · decision 54) — the SAME --nuri-type-*
 * primitives the web reads through the .nuri-type-* utility classes
 * (styles/typography.css). ONE source, TWO readers (the icon model ·
 * decision 48). The relative→absolute conversion lives in ONE place:
 * `typeStyle(key)` (now in _shared · decision 54).
 *
 * The COLOUR IS on the runtime surface: a default line is text-primary,
 * a `muted` line is text-muted — both from the chrome[theme] slice,
 * exactly like the web `nuri-typography[data-muted]` dispatch repaints
 * under [data-theme] (decision 42 / 53). (RN has no `currentColor`, so
 * the web default-inherits-currentColor maps to text-primary here.)
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Text } from 'react-native';
import { NuriThemeContext, typeStyle, chrome, type TypeSize, type TypeKey } from './_shared';

export type TypographyProps = {
  size?: TypeSize;
  emphasis?: boolean;
  muted?: boolean;
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
};

// Web `align` is logical `text-align: start|center|end` (RTL-aware). RN's
// `textAlign` has NO logical start/end — it is auto|left|right|center|justify
// — so we map to PHYSICAL left/right (the LTR case · decision 59). True RTL
// would flip end↔left via I18nManager.isRTL / writingDirection; logged as a
// friction, not solved here (P11).
const TEXT_ALIGN_MAP: Record<NonNullable<TypographyProps['align']>, 'left' | 'center' | 'right'> = {
  start:  'left',
  center: 'center',
  end:    'right',
};

export const Typography: React.FC<TypographyProps> = ({
  size = 'md',
  emphasis = false,
  muted = false,
  align,
  children,
}) => {
  const { mode } = React.useContext(NuriThemeContext);
  const key: TypeKey = emphasis ? `${size}Em` : size;
  // `muted` (boolean · decision 53) → text-muted; otherwise text-primary,
  // both from the runtime chrome slice (the RN analogue of the web
  // [data-muted] colour dispatch · decision 42).
  const color = muted ? chrome[mode].textMuted : chrome[mode].textPrimary;
  return (
    <Text style={{ ...typeStyle(key), color, ...(align ? { textAlign: TEXT_ALIGN_MAP[align] } : null) }}>
      {children}
    </Text>
  );
};
