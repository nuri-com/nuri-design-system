// ════════════════════════════════════════════════════════════════
// Scroll — the structural flex-fill + overflow · RN <ScrollView>
// (scroll.js:8 · "a thin component over <ScrollView>") · no namespace.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { ScrollView as RNScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useFixedRegionLayout } from './FixedRegionLayout';
import { SCREEN_STYLE, withKeys } from './shared';

export type ScrollInsetBottom = 'none' | 'dock';
export type ScrollInsetTop = 'none' | 'dock';
export type ScrollProps = { insetTop?: ScrollInsetTop; insetBottom?: ScrollInsetBottom; children?: React.ReactNode };

const ScrollImpl: React.FC<ScrollProps> = ({ insetTop = 'none', insetBottom = 'none', children }) => {
  const { dockTopInset, dockBottomInset } = useFixedRegionLayout();
  const insetStyle: ViewStyle = {};
  if (insetTop === 'dock' && dockTopInset > 0) insetStyle.paddingTop = dockTopInset;
  if (insetBottom === 'dock' && dockBottomInset > 0) insetStyle.paddingBottom = dockBottomInset;
  const contentStyle = Object.keys(insetStyle).length ? [SCROLL_CONTENT_STYLE, insetStyle] : SCROLL_CONTENT_STYLE;

  return (
    <RNScrollView style={SCREEN_STYLE} contentContainerStyle={contentStyle}>{children}</RNScrollView>
  );
};
ScrollImpl.displayName = 'Scroll';
export const Scroll = withKeys(ScrollImpl, ['insetTop', 'insetBottom']);
const SCROLL_CONTENT_STYLE: ViewStyle = { flexGrow: 1 };
