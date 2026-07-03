// ════════════════════════════════════════════════════════════════
// Scroll — the structural flex-fill + overflow · RN <ScrollView>
// (scroll.js:8 · "a thin component over <ScrollView>") · no namespace.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { ScrollView as RNScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { SCREEN_STYLE, withKeys } from './shared';
import { ScreenDockContext } from './Screen';

export type ScrollInsetBottom = 'none' | 'dock';
export type ScrollInsetTop = 'none' | 'dock';
export type ScrollProps = { insetTop?: ScrollInsetTop; insetBottom?: ScrollInsetBottom; children?: React.ReactNode };

const ScrollImpl: React.FC<ScrollProps> = ({ insetTop = 'none', insetBottom = 'none', children }) => {
  const { topInset, bottomInset } = React.useContext(ScreenDockContext);
  const insetStyle: ViewStyle = {};
  if (insetTop === 'dock' && topInset > 0) insetStyle.paddingTop = topInset;
  if (insetBottom === 'dock' && bottomInset > 0) insetStyle.paddingBottom = bottomInset;
  const contentStyle = Object.keys(insetStyle).length ? [SCROLL_CONTENT_STYLE, insetStyle] : SCROLL_CONTENT_STYLE;

  return (
    <RNScrollView style={SCREEN_STYLE} contentContainerStyle={contentStyle}>{children}</RNScrollView>
  );
};
ScrollImpl.displayName = 'Scroll';
export const Scroll = withKeys(ScrollImpl, ['insetTop', 'insetBottom']);
const SCROLL_CONTENT_STYLE: ViewStyle = { flexGrow: 1 };
