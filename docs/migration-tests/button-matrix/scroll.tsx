/* ══════════════════════════════════════════════════════════════════
 * SCROLL · the RN side of <nuri-scroll> · decision 59 · N+11
 * ──────────────────────────────────────────────────────────────────
 * The growing, scrolling body. A <ScrollView style={{ flex: 1 }}>.
 * Scrolling is a COMPONENT in RN, not a View style — which is exactly
 * why it is its own primitive and `overflow` is never a Box prop (R1).
 * Padding for the content goes on a <Box fill> CHILD, which is the
 * `contentContainerStyle` analogue (Box fill == { flexGrow: 1 }) — so
 * the Scroll box itself stays padding-free.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';

export type ScrollProps = { children?: React.ReactNode; style?: StyleProp<ViewStyle> };

export const Scroll: React.FC<ScrollProps> = ({ children, style }) => (
  <ScrollView style={[{ flex: 1 }, style]}>{children}</ScrollView>
);
