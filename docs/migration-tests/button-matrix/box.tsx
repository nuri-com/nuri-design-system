/* ══════════════════════════════════════════════════════════════════
 * BOX · the RN side of <nuri-box> · N+6.2 · decision 37
 * ──────────────────────────────────────────────────────────────────
 * RN-side spec for the web <nuri-box> custom element
 * (lib/components/box/). Operator-locked API (padding family):
 *
 *   padding?  / paddingX? / paddingY?:            'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   paddingStart? / paddingEnd?:                  'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   paddingTop? / paddingBottom?:                 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   center?:    boolean
 *   fill?:      boolean
 *
 * No `as` prop on RN — `as` was a web concern for host element
 * resolution. On RN, Box renders <View>.
 *
 * The `padding*` props read against the runtime `space` set; the
 * 5-leaf subset matches the prop on the web side. No component-token
 * aliasing (decision 37) — `space[padding]` is read at the call site.
 *
 * ⚠ DRIFT (logged · roadmap/N+12b.md): the web Box ALSO ships
 * `background` (canvas/subtle/strong/accent-solid/accent-subtle) and
 * `radius` (sm/md/lg/full) visual props (decision 42 · box.js ATTRS).
 * This RN mirror does NOT carry them — surfaces pass colour/radius via
 * the `style` escape hatch instead (see the Tabs container). Whether
 * the RN Box should gain those token-resolving props is an OPEN
 * decision (it would make Box context-aware, changing its pure-layout
 * character) — logged, NOT silently added in the N+12b split.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { space, type SpaceLeaf } from './_shared';

export type BoxProps = {
  padding?: SpaceLeaf;
  paddingX?: SpaceLeaf;
  paddingY?: SpaceLeaf;
  paddingStart?: SpaceLeaf;
  paddingEnd?: SpaceLeaf;
  paddingTop?: SpaceLeaf;
  paddingBottom?: SpaceLeaf;
  center?: boolean;
  // fill (decision 60) → grow to fill the flex parent (e.g. a Scroll body),
  // so a filling child + a Spacer can push trailing content to the bottom.
  // An RN <View> is already a flex column (flexDirection defaults 'column'),
  // so unlike the web Box (display:block → must switch to flex) this only
  // needs the grow part. { flexGrow: 1, flexShrink: 0 } == web `flex: 1 0 auto`.
  fill?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Box: React.FC<BoxProps> = ({
  padding,
  paddingX,
  paddingY,
  paddingStart,
  paddingEnd,
  paddingTop,
  paddingBottom,
  center,
  fill,
  children,
  style,
}) => {
  // Edge-specific wins over axis wins over uniform — same precedence
  // the CSS encodes in its selector ordering.
  const layout: ViewStyle = {
    ...(padding ? { padding: space[padding] } : null),
    ...(paddingX ? { paddingHorizontal: space[paddingX] } : null),
    ...(paddingY ? { paddingVertical: space[paddingY] } : null),
    ...(paddingStart  ? { paddingStart:  space[paddingStart]  } : null),
    ...(paddingEnd    ? { paddingEnd:    space[paddingEnd]    } : null),
    ...(paddingTop    ? { paddingTop:    space[paddingTop]    } : null),
    ...(paddingBottom ? { paddingBottom: space[paddingBottom] } : null),
    ...(center ? { marginHorizontal: 'auto' as const } : null),
    ...(fill ? { flexGrow: 1, flexShrink: 0 } : null),
  };
  return <View style={[layout, style]}>{children}</View>;
};
