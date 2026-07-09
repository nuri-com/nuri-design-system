import * as React from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';
import type { KeyboardEvent } from 'react-native';

export type FixedRegionLayoutValue = {
  headerHeight: number;
  footerHeight: number;
  keyboardOffset: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  scrollMaxHeight?: number;
  dockTopInset: number;
  dockBottomInset: number;
  setHeaderHeight: (height: number) => void;
  setFooterHeight: (height: number) => void;
  setDockTopInset: (height: number) => void;
  setDockBottomInset: (height: number) => void;
};

export type FixedRegionLayoutProviderProps = {
  children?: React.ReactNode;
  keyboardEnabled?: boolean;
  safeAreaTop?: number;
  safeAreaBottom?: number;
  scrollMaxHeight?: number;
  windowHeight?: number;
};

const DEFAULT_LAYOUT_VALUE: FixedRegionLayoutValue = {
  headerHeight: 0,
  footerHeight: 0,
  keyboardOffset: 0,
  safeAreaTop: 0,
  safeAreaBottom: 0,
  dockTopInset: 0,
  dockBottomInset: 0,
  setHeaderHeight: () => undefined,
  setFooterHeight: () => undefined,
  setDockTopInset: () => undefined,
  setDockBottomInset: () => undefined,
};

const FixedRegionLayoutContext = React.createContext<FixedRegionLayoutValue>(DEFAULT_LAYOUT_VALUE);

function normalizeInset(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value ?? 0)) : 0;
}

function resolveKeyboardOffset(event: KeyboardEvent, windowHeight: number): number {
  const { height, screenY } = event.endCoordinates;
  if (Platform.OS === 'android' && screenY > 0) {
    return Math.max(0, Math.round(windowHeight - screenY));
  }
  if (height > 0) return Math.round(height);
  return screenY > 0 ? Math.max(0, Math.round(windowHeight - screenY)) : 0;
}

export const FixedRegionLayoutProvider: React.FC<FixedRegionLayoutProviderProps> = ({
  children,
  keyboardEnabled = false,
  safeAreaTop = 0,
  safeAreaBottom = 0,
  scrollMaxHeight,
  windowHeight,
}) => {
  const dimensions = useWindowDimensions();
  const effectiveWindowHeight = windowHeight ?? dimensions.height;
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [footerHeight, setFooterHeight] = React.useState(0);
  const [dockTopInset, setDockTopInset] = React.useState(0);
  const [dockBottomInset, setDockBottomInset] = React.useState(0);
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);

  React.useEffect(() => {
    if (!keyboardEnabled) {
      setKeyboardOffset(0);
      return;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      setKeyboardOffset(resolveKeyboardOffset(event, effectiveWindowHeight));
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [effectiveWindowHeight, keyboardEnabled]);

  const value = React.useMemo<FixedRegionLayoutValue>(
    () => ({
      headerHeight,
      footerHeight,
      keyboardOffset,
      safeAreaTop: normalizeInset(safeAreaTop),
      safeAreaBottom: normalizeInset(safeAreaBottom),
      scrollMaxHeight,
      dockTopInset,
      dockBottomInset,
      setHeaderHeight,
      setFooterHeight,
      setDockTopInset,
      setDockBottomInset,
    }),
    [
      headerHeight,
      footerHeight,
      keyboardOffset,
      safeAreaTop,
      safeAreaBottom,
      scrollMaxHeight,
      dockTopInset,
      dockBottomInset,
    ],
  );

  return (
    <FixedRegionLayoutContext.Provider value={value}>
      {children}
    </FixedRegionLayoutContext.Provider>
  );
};
FixedRegionLayoutProvider.displayName = 'FixedRegionLayoutProvider';

export function useFixedRegionLayout(): FixedRegionLayoutValue {
  return React.useContext(FixedRegionLayoutContext);
}
