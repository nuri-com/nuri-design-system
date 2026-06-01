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
 * VISUAL props (decision 42 · D1 · N+13) · faithful to box.js ATTRS:
 *   background? : 'canvas' | 'subtle' | 'strong' | 'accent-solid' | 'accent-subtle'
 *   radius?     : 'sm' | 'md' | 'lg' | 'full'
 * `background` resolves a chrome/accent surface token at render time, so
 * Box is now a context-aware surface consumer (it reads the runtime
 * (accent × mode) slice via useRuntimeTokens — the same NuriThemeContext
 * every other consumer reads). `radius` reads the cascade-invariant
 * `radius` set directly. The web→RN mapping is 1:1 with box.css's
 * data-background / data-radius selectors.
 *
 * ⚠ BEHAVIOURAL DELTA (F-BOX-FG-1 · friction-delta): on web,
 * `background="accent-solid"` ALSO sets `color: var(--nuri-accent-on-solid)`
 * so descendant text inherits the on-solid foreground. RN has no
 * colour inheritance from a `<View>` into child `<Text>`, so this
 * mirror sets ONLY `backgroundColor` — a consumer placing text on an
 * accent-solid Box must set the text colour explicitly (e.g. read
 * `accent.onSolid`). Props stay 1:1; only the coupled-foreground
 * inheritance mechanism differs — exactly the budget R1 names.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { space, useRuntimeTokens, resolveToken, type SpaceLeaf, type TokenPath } from './_shared';

export type BoxBackground = 'canvas' | 'subtle' | 'strong' | 'accent-solid' | 'accent-subtle';
export type BoxRadius = 'sm' | 'md' | 'lg' | 'full';

// background enum → the surface TokenPath box.css dispatches to. The
// accent-solid foreground twin (accent.onSolid) is web-only here — see
// F-BOX-FG-1 in the header.
const BACKGROUND_PATH: Record<BoxBackground, TokenPath> = {
  canvas:          'chrome.bgCanvas',
  subtle:          'chrome.bgSubtle',
  strong:          'chrome.bgStrong',
  'accent-solid':  'accent.solid',
  'accent-subtle': 'accent.bgSubtle',
};

export type BoxProps = {
  padding?: SpaceLeaf;
  paddingX?: SpaceLeaf;
  paddingY?: SpaceLeaf;
  paddingStart?: SpaceLeaf;
  paddingEnd?: SpaceLeaf;
  paddingTop?: SpaceLeaf;
  paddingBottom?: SpaceLeaf;
  background?: BoxBackground;
  radius?: BoxRadius;
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
  background,
  radius,
  center,
  fill,
  children,
  style,
}) => {
  // Surface props resolve against the live (accent × mode) slice — the
  // same NuriThemeContext every consumer reads. Cheap to read even when
  // no background/radius is set (hooks must run unconditionally).
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
    ...(background ? { backgroundColor: resolveToken(tokens, BACKGROUND_PATH[background]) as string } : null),
    ...(radius ? { borderRadius: tokens.radius[radius] } : null),
    ...(center ? { marginHorizontal: 'auto' as const } : null),
    ...(fill ? { flexGrow: 1, flexShrink: 0 } : null),
  };
  return <View style={[layout, style]}>{children}</View>;
};
