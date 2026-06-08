/* ══════════════════════════════════════════════════════════════════
 * STACK · the RN side of <nuri-stack> · N+6.2 · decision 37
 * ──────────────────────────────────────────────────────────────────
 * RN-side spec for the web <nuri-stack> custom element
 * (lib/components/stack/). Operator-locked API:
 *
 *   direction?: 'column' | 'row'                          default 'column'
 *   gap?:       'xs' | 'sm' | 'md' | 'lg' | 'xl'          subset of space
 *   align?:     'start' | 'center' | 'end' | 'stretch' | 'baseline'
 *   justify?:   'start' | 'center' | 'end' | 'between' | 'around'
 *   wrap?:      boolean
 *   fill?:      boolean
 *
 * No `as` prop on RN — `as` was a web concern for host element
 * resolution. On RN, both Stack and Box render <View>.
 *
 * The `gap` prop reads against the runtime `space` set; the 5-leaf
 * subset matches what the prop accepts on the web side. No
 * component-token aliasing (decision 37) — the dispatch happens at the
 * call site by reading `space[gap]` directly.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { space, type SpaceLeaf } from './_shared';

export type StackProps = {
  direction?: 'column' | 'row';
  gap?: SpaceLeaf;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  // fill · enum grow | grow-shrink, keeping the decision-60 boolean
  // (true / 'grow' → grow; 'grow-shrink' → the Topbar content-pivot · B1.5
  // §3). grow → { flexGrow:1, flexShrink:0 } == web `flex:1 0 auto` (fill
  // when short, keep content height when tall so a Scroll scrolls instead
  // of clipping). grow-shrink → { flexGrow:1, flexShrink:1 } == web
  // `flex:1 1 auto`.
  // SEAM (R1): the web grow-shrink ALSO sets `min-inline-size:0` so the
  // item can shrink below its content's intrinsic width; RN/Yoga flex
  // items already default their min main-size to 0, so the shrink alone
  // reproduces it — noted, no extra knob.
  fill?: boolean | 'grow' | 'grow-shrink';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ALIGN_MAP: Record<NonNullable<StackProps['align']>, ViewStyle['alignItems']> = {
  start:    'flex-start',
  center:   'center',
  end:      'flex-end',
  stretch:  'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<NonNullable<StackProps['justify']>, ViewStyle['justifyContent']> = {
  start:   'flex-start',
  center:  'center',
  end:     'flex-end',
  between: 'space-between',
  around:  'space-around',
};

export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  gap,
  align,
  justify,
  wrap,
  fill,
  children,
  style,
}) => {
  const layout: ViewStyle = {
    flexDirection: direction,
    ...(gap ? { gap: space[gap] } : null),
    ...(align ? { alignItems: ALIGN_MAP[align] } : null),
    ...(justify ? { justifyContent: JUSTIFY_MAP[justify] } : null),
    ...(wrap ? { flexWrap: 'wrap' } : null),
    ...(fill
      ? (fill === 'grow-shrink'
          ? { flexGrow: 1, flexShrink: 1 }
          : { flexGrow: 1, flexShrink: 0 })
      : null),
  };
  return <View style={[layout, style]}>{children}</View>;
};
