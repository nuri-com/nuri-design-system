/* ══════════════════════════════════════════════════════════════════
 * SCREEN · the RN side of <nuri-screen> · decision 58 · N+11
 * ──────────────────────────────────────────────────────────────────
 * The full-height column. A <View style={{ flex: 1 }}> (later the
 * themed SafeAreaProvider root). It is NOT the navigator: the bottom
 * TabBar is a SIBLING, and safe-area is owned upstream by the navigator
 * (React Navigation), so Screen stays inset-agnostic.
 *
 * No `as` prop on RN (the web `as` was host-element resolution). On RN,
 * Screen renders <View>.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type ScreenProps = { children?: React.ReactNode; style?: StyleProp<ViewStyle> };

export const Screen: React.FC<ScreenProps> = ({ children, style }) => (
  <View style={[{ flex: 1 }, style]}>{children}</View>
);
