/* ══════════════════════════════════════════════════════════════════
 * BOX · the RN side of <nuri-box> · N+6.2 · decision 37
 * ──────────────────────────────────────────────────────────────────
 * RN-side spec for the web <nuri-box> custom element
 * (lib/components/box/). Operator-locked API — PURELY GEOMETRIC
 * (65.3 §6 · amendments 42.1/60.1 · N+19 U3):
 *
 *   padding?  / paddingX? / paddingY?:            'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   paddingStart? / paddingEnd?:                  'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   paddingTop? / paddingBottom?:                 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   width? / height? / minHeight?:                'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
 *   radius?:    'sm' | 'md' | 'lg' | 'full'
 *   center?:    boolean
 *
 * Box owns NO colour (`background` removed · amendment 42.1 — colour
 * is the palette namespace's, resolved via resolvePalette / the
 * emitted build/palette.ts mapping) and NO flex-child behaviour
 * (`fill` removed · amendment 60.1 — stack's `fill` enum carries the
 * semantic: grow | grow-shrink). The namespaces are disjoint — a
 * surface node merges Box geometry with a palette-resolved
 * backgroundColor on ONE <View> (see tabs.tsx).
 *
 * No `as` prop on RN — `as` was a web concern for host element
 * resolution. On RN, Box renders <View>.
 *
 * The `padding*` props read against the runtime `space` set; the
 * 5-leaf subset matches the prop on the web side. No component-token
 * aliasing (decision 37) — `space[padding]` is read at the call site.
 *
 * SIZING props (B2a · 65.3 §6 · box = geometry, NO colour) · faithful
 * to box.js ATTRS. `width` / `height` / `minHeight` read the `size` set
 * directly (the FULL xs..3xl scale · decision 36). web→RN seam (R1): the
 * web uses the LOGICAL inline-size / block-size / min-block-size; RN/Yoga
 * has no logical sizing axis, so the mirror maps to the PHYSICAL
 * width / height / minHeight — 1:1 in LTR. No component-token aliasing.
 *
 * RADIUS (decision 42 · D1 · N+13 · the surviving, geometric half of
 * 42) · faithful to box.js ATTRS: reads the cascade-invariant `radius`
 * set directly; 1:1 with box.css's data-radius selectors.
 *
 * F-BOX-FG-1 · the Box half of that friction RETIRES with the
 * `background` prop (N+19 U3): there is no Box surface left to couple
 * a foreground to. Colour ownership is palette's end-to-end (engine:
 * B2b · delivery: B2c) — the resolver returns the COMPLETE pair
 * (bg AND fg) and the CALLER passes the resolved fg to each text/icon
 * part explicitly, never via inheritance (palette.tsx header).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { space, size, useRuntimeTokens, type SpaceLeaf, type SizeLeaf } from './_shared';

export type BoxRadius = 'sm' | 'md' | 'lg' | 'full';

export type BoxProps = {
  padding?: SpaceLeaf;
  paddingX?: SpaceLeaf;
  paddingY?: SpaceLeaf;
  paddingStart?: SpaceLeaf;
  paddingEnd?: SpaceLeaf;
  paddingTop?: SpaceLeaf;
  paddingBottom?: SpaceLeaf;
  // Sizing · element dimensions (full size.* scale · 65.3 §6 box = geometry,
  // no colour). SEAM (R1): web box.css uses the LOGICAL inline-size /
  // block-size / min-block-size; RN/Yoga has no logical sizing axis, so the
  // mirror maps to the PHYSICAL width / height / minHeight (1:1 in LTR).
  width?: SizeLeaf;
  height?: SizeLeaf;
  minHeight?: SizeLeaf;
  radius?: BoxRadius;
  center?: boolean;
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
  width,
  height,
  minHeight,
  radius,
  center,
  children,
  style,
}) => {
  // `radius` resolves against the live runtime slice — the same
  // NuriThemeContext every consumer reads (the radius set is cascade-
  // invariant; the hook must run unconditionally regardless).
  const tokens = useRuntimeTokens();

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
    ...(width     ? { width:     size[width]     } : null),
    ...(height    ? { height:    size[height]    } : null),
    ...(minHeight ? { minHeight: size[minHeight] } : null),
    ...(radius ? { borderRadius: tokens.radius[radius] } : null),
    ...(center ? { marginHorizontal: 'auto' as const } : null),
  };
  return <View style={[layout, style]}>{children}</View>;
};
