// ════════════════════════════════════════════════════════════════
// Scroll — the structural flex-fill + overflow · RN <ScrollView>
// (scroll.js:8 · "a thin component over <ScrollView>") · no namespace.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { ScrollView as RNScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { SCREEN_STYLE, withKeys } from './shared';

export type ScrollProps = { children?: React.ReactNode };

const ScrollImpl: React.FC<ScrollProps> = ({ children }) => (
  <RNScrollView style={SCREEN_STYLE} contentContainerStyle={SCROLL_CONTENT_STYLE}>{children}</RNScrollView>
);
ScrollImpl.displayName = 'Scroll';
export const Scroll = withKeys(ScrollImpl, []);
const SCROLL_CONTENT_STYLE: ViewStyle = { flexGrow: 1 };
