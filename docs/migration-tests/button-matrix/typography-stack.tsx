/* ══════════════════════════════════════════════════════════════════
 * TYPOGRAPHY-STACK · the RN side of <nuri-typography-stack> · decision 53
 * ──────────────────────────────────────────────────────────────────
 * Single-element rhythm container (decision 53): it wraps plain
 * Typography lines and owns ONLY the inter-line rhythm (decision 47).
 *   direction?: 'column' | 'row'   default 'column'
 *   children:   Typography lines
 *
 * column → tight 2xs leading; row → wider xs gutter + baseline alignment
 * so mixed-size lines share a text baseline. The gap is OWNED, not a
 * prop. The former -element / `level` sub-scale was eliminated (decision
 * 53) — the author composes size / emphasis / muted on each line.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View } from 'react-native';
import { space } from './_shared';

export type TypographyStackProps = {
  direction?: 'column' | 'row';
  children?: React.ReactNode;
};

export const TypographyStack: React.FC<TypographyStackProps> = ({ direction = 'column', children }) => (
  <View
    style={{
      flexDirection: direction,
      gap: direction === 'row' ? space.xs : space['2xs'],
      ...(direction === 'row' ? { alignItems: 'baseline' as const } : null),
    }}
  >
    {children}
  </View>
);
