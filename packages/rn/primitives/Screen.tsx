// ════════════════════════════════════════════════════════════════
// Screen — the structural flex-column fill · RN <View style={{flex:1}}>
// (screen.js:9 · "a thin component over <View> · flex:1") · no namespace.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { SCREEN_STYLE, withKeys } from './shared';

export type ScreenProps = { children?: React.ReactNode };

type ScreenDockContextValue = {
  topInset: number;
  bottomInset: number;
  setTopInset: (height: number) => void;
  setBottomInset: (height: number) => void;
};

export const ScreenDockContext = React.createContext<ScreenDockContextValue>({
  topInset: 0,
  bottomInset: 0,
  setTopInset: () => undefined,
  setBottomInset: () => undefined,
});

const SCREEN_DOCK_STYLE: ViewStyle = { ...SCREEN_STYLE, position: 'relative', overflow: 'hidden' };

const ScreenImpl: React.FC<ScreenProps> = ({ children }) => {
  const [topInset, setTopInset] = React.useState(0);
  const [bottomInset, setBottomInset] = React.useState(0);
  const value = React.useMemo(
    () => ({ topInset, bottomInset, setTopInset, setBottomInset }),
    [topInset, bottomInset],
  );

  return (
    <ScreenDockContext.Provider value={value}>
      <RNView style={SCREEN_DOCK_STYLE}>{children}</RNView>
    </ScreenDockContext.Provider>
  );
};
ScreenImpl.displayName = 'Screen';
export const Screen = withKeys(ScreenImpl, []);
