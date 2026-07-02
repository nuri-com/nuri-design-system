// ════════════════════════════════════════════════════════════════
// Screen — the structural flex-column fill · RN <View style={{flex:1}}>
// (screen.js:9 · "a thin component over <View> · flex:1") · no namespace.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import { SCREEN_STYLE, withKeys } from './shared';

export type ScreenProps = { children?: React.ReactNode };

const ScreenImpl: React.FC<ScreenProps> = ({ children }) => (
  <RNView style={SCREEN_STYLE}>{children}</RNView>
);
ScreenImpl.displayName = 'Screen';
export const Screen = withKeys(ScreenImpl, []);
