import * as React from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';
import type { KeyboardEvent, LayoutChangeEvent } from 'react-native';

export type FixedRegionLayoutValue = {
  headerHeight: number;
  footerHeight: number;
  keyboardHeight: number;
  keyboardScreenY: number | null;
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
  keyboardHeight: 0,
  keyboardScreenY: null,
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

function resolveKeyboardOffset(height: number, screenY: number | null, windowHeight: number): number {
  if (Platform.OS === 'android' && screenY !== null) {
    return Math.max(0, Math.round(windowHeight - screenY));
  }
  if (height > 0) return Math.round(height);
  return screenY !== null ? Math.max(0, Math.round(windowHeight - screenY)) : 0;
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
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [keyboardScreenY, setKeyboardScreenY] = React.useState<number | null>(null);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
      setKeyboardScreenY(event.endCoordinates.screenY > 0 ? event.endCoordinates.screenY : null);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setKeyboardScreenY(null);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const keyboardOffset = keyboardEnabled
    ? resolveKeyboardOffset(keyboardHeight, keyboardScreenY, effectiveWindowHeight)
    : 0;

  const value = React.useMemo<FixedRegionLayoutValue>(
    () => ({
      headerHeight,
      footerHeight,
      keyboardHeight,
      keyboardScreenY,
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
      keyboardHeight,
      keyboardScreenY,
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

type FixedRegionKind = 'header' | 'footer' | 'dockTop' | 'dockBottom';

export function useRegisterRegion(
  kind: FixedRegionKind,
  consumerOnLayout?: (event: LayoutChangeEvent) => void,
): (event: LayoutChangeEvent) => void {
  const {
    setHeaderHeight,
    setFooterHeight,
    setDockTopInset,
    setDockBottomInset,
  } = useFixedRegionLayout();
  const report =
    kind === 'header'
      ? setHeaderHeight
      : kind === 'footer'
        ? setFooterHeight
        : kind === 'dockTop'
          ? setDockTopInset
          : setDockBottomInset;
  const measuredHeight = React.useRef(0);

  React.useEffect(
    () => () => {
      measuredHeight.current = 0;
      report(0);
    },
    [report],
  );

  return React.useCallback(
    (event: LayoutChangeEvent) => {
      const next = Math.round(event.nativeEvent.layout.height);
      if (measuredHeight.current !== next) {
        measuredHeight.current = next;
        report(next);
      }
      consumerOnLayout?.(event);
    },
    [consumerOnLayout, report],
  );
}
