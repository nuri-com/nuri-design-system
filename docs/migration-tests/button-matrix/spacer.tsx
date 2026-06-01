/* ══════════════════════════════════════════════════════════════════
 * SPACER · the RN side of <nuri-spacer> · decision 59 / 61 · N+11
 * ──────────────────────────────────────────────────────────────────
 * A flexible gap. Grow (no size) → flex: grow (a positive RN `flex` IS
 * proportional flexGrow · decision 61, so the `grow` prop maps 1:1).
 * Fixed (size) → a definite width (row) / height (column) from the
 * space set. No `as`/`direction`-for-grow concern: grow follows the
 * parent's main axis; `direction` only picks which dimension a fixed
 * size fills. (`grow` was renamed from `weight` 2026-06-01 · the web
 * `weight` collided with font-weight.)
 *
 * API (mirrors spacer.css):
 *   direction?: 'row' | 'column'           default 'row'
 *   size?:      'xs'..'xl' (SpaceLeaf)      fixed extent · omitted → grow
 *   grow?:      1 | 2 | 3 | 4               proportional grow share · default 1
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View, type ViewStyle } from 'react-native';
import { space, type SpaceLeaf } from './_shared';

export type SpacerProps = {
  direction?: 'row' | 'column';
  size?: SpaceLeaf;
  grow?: 1 | 2 | 3 | 4;
};

export const Spacer: React.FC<SpacerProps> = ({ direction = 'row', size, grow = 1 }) => {
  // Fixed (size) → a definite extent on the chosen axis, no grow.
  // Grow (no size) → flex: grow (proportional flexGrow · decision 61).
  const style: ViewStyle = size
    ? (direction === 'column' ? { height: space[size] } : { width: space[size] })
    : { flex: grow };
  return <View style={style} />;
};
