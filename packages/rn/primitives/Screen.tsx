// ════════════════════════════════════════════════════════════════
// Screen — the structural flex-column fill · RN <View style={{flex:1}}>
// (screen.js:9 · "a thin component over <View> · flex:1") · no namespace.
// Safe-area application is an authoring boolean: the app/navigator reads native
// insets once into NuriSafeAreaProvider, and Screen applies requested edges.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useNuriSafeAreaInsets } from '../safe-area';
import { FixedRegionLayoutProvider } from './FixedRegionLayout';
import { SCREEN_STYLE, withKeys } from './shared';

export type ScreenProps = {
  safeArea?: boolean;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  children?: React.ReactNode;
};

const SCREEN_DOCK_STYLE: ViewStyle = { ...SCREEN_STYLE, position: 'relative', overflow: 'hidden' };

const ScreenImpl: React.FC<ScreenProps> = ({
  safeArea = false,
  safeAreaTop = false,
  safeAreaBottom = false,
  children,
}) => {
  const insets = useNuriSafeAreaInsets();
  const safeAreaStyle: ViewStyle = {};
  if ((safeArea || safeAreaTop) && insets.top > 0) safeAreaStyle.paddingTop = insets.top;
  if ((safeArea || safeAreaBottom) && insets.bottom > 0) safeAreaStyle.paddingBottom = insets.bottom;
  const style = Object.keys(safeAreaStyle).length ? [SCREEN_DOCK_STYLE, safeAreaStyle] : SCREEN_DOCK_STYLE;

  return (
    <FixedRegionLayoutProvider keyboardEnabled safeAreaTop={insets.top} safeAreaBottom={insets.bottom}>
      <RNView style={style}>{children}</RNView>
    </FixedRegionLayoutProvider>
  );
};
ScreenImpl.displayName = 'Screen';
export const Screen = withKeys(ScreenImpl, ['safeArea', 'safeAreaTop', 'safeAreaBottom']);
