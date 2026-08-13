import * as React from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';
import type { KeyboardEvent, LayoutChangeEvent } from 'react-native';

export type FixedRegionHostGeometry = 'fill' | 'content';
export type FixedRegionHeaderPresentation = 'structural' | 'overlay';

export type FixedRegionLayoutValue = {
  keyboardEnabled: boolean;
  hostGeometry: FixedRegionHostGeometry;
  headerPresentation: FixedRegionHeaderPresentation;
  keyboardHeight: number;
  keyboardScreenY: number | null;
  frameKeyboardInset: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  viewportFallbackHeight?: number;
  dockTopInset: number;
  dockBottomInset: number;
  setDockTopInset: (height: number) => void;
  setDockBottomInset: (height: number) => void;
};

export type FixedRegionLayoutProviderProps = {
  children?: React.ReactNode;
  keyboardEnabled?: boolean;
  hostGeometry?: FixedRegionHostGeometry;
  headerPresentation?: FixedRegionHeaderPresentation;
  safeAreaTop?: number;
  safeAreaBottom?: number;
  viewportFallbackHeight?: number;
  windowHeight?: number;
};

const DEFAULT_LAYOUT_VALUE: FixedRegionLayoutValue = {
  keyboardEnabled: false,
  hostGeometry: 'fill',
  headerPresentation: 'structural',
  keyboardHeight: 0,
  keyboardScreenY: null,
  frameKeyboardInset: 0,
  safeAreaTop: 0,
  safeAreaBottom: 0,
  dockTopInset: 0,
  dockBottomInset: 0,
  setDockTopInset: () => undefined,
  setDockBottomInset: () => undefined,
};

const FixedRegionLayoutContext = React.createContext<FixedRegionLayoutValue>(DEFAULT_LAYOUT_VALUE);

function normalizeInset(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value ?? 0)) : 0;
}

function resolveFrameKeyboardInset(
  height: number,
  screenY: number | null,
  windowHeight: number,
  baselineWindowHeight: number,
): number {
  // Android usually publishes a resized window, but translucent system chrome
  // and Expo Go can leave some or all of the keyboard over the frame. RN's
  // Android event height excludes the bottom system-bar strip, while screenY
  // identifies the keyboard's actual top edge. Use whichever residual is
  // larger so edge-to-edge hosts include that strip without double-applying
  // keyboard space already consumed by adjustResize.
  if (Platform.OS === 'android') {
    const viewportShrink = Math.max(0, baselineWindowHeight - windowHeight);
    const heightResidual = Math.max(0, height - viewportShrink);
    const frameResidual = screenY !== null ? Math.max(0, windowHeight - screenY) : 0;
    return Math.max(0, Math.round(Math.max(heightResidual, frameResidual)));
  }
  if (height > 0) return Math.round(height);
  return screenY !== null ? Math.max(0, Math.round(windowHeight - screenY)) : 0;
}

function keyboardFrame(event: KeyboardEvent): { height: number; screenY: number | null } {
  const height = normalizeInset(event.endCoordinates.height);
  const rawScreenY = event.endCoordinates.screenY;
  const screenY = Number.isFinite(rawScreenY) && rawScreenY > 0 ? Math.round(rawScreenY) : null;
  return { height, screenY };
}

function scheduleKeyboardLayout(event: KeyboardEvent): void {
  if (Platform.OS !== 'ios') return;
  Keyboard.scheduleLayoutAnimation?.(event);
}

export const FixedRegionLayoutProvider: React.FC<FixedRegionLayoutProviderProps> = ({
  children,
  keyboardEnabled = false,
  hostGeometry = 'fill',
  headerPresentation = 'structural',
  safeAreaTop = 0,
  safeAreaBottom = 0,
  viewportFallbackHeight,
  windowHeight,
}) => {
  const dimensions = useWindowDimensions();
  const effectiveWindowHeight = windowHeight ?? dimensions.height;
  const baselineWindowHeight = React.useRef(effectiveWindowHeight);
  const baselineWindowWidth = React.useRef(dimensions.width);
  const effectiveWindowHeightRef = React.useRef(effectiveWindowHeight);
  const [dockTopInset, setDockTopInset] = React.useState(0);
  const [dockBottomInset, setDockBottomInset] = React.useState(0);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [keyboardScreenY, setKeyboardScreenY] = React.useState<number | null>(null);

  effectiveWindowHeightRef.current = effectiveWindowHeight;

  React.useEffect(() => {
    if (baselineWindowWidth.current !== dimensions.width && keyboardHeight === 0) {
      baselineWindowWidth.current = dimensions.width;
      baselineWindowHeight.current = effectiveWindowHeight;
    } else if (effectiveWindowHeight > baselineWindowHeight.current) {
      baselineWindowHeight.current = effectiveWindowHeight;
    }
  }, [dimensions.width, effectiveWindowHeight, keyboardHeight]);

  React.useEffect(() => {
    if (!keyboardEnabled) {
      setKeyboardHeight(0);
      setKeyboardScreenY(null);
      return;
    }

    // Every fresh ownership subscription starts from resting geometry. The
    // ordinary disable path already clears state; this rising-edge reset is
    // defense in depth against a retained presented-layer subtree.
    setKeyboardHeight(0);
    setKeyboardScreenY(null);

    const updateKeyboardFrame = (event: KeyboardEvent) => {
      scheduleKeyboardLayout(event);
      const next = keyboardFrame(event);
      setKeyboardHeight(next.height);
      setKeyboardScreenY(next.screenY);
    };
    const updateChangingKeyboardFrame = (event: KeyboardEvent) => {
      const next = keyboardFrame(event);
      // iOS emits an off-screen change immediately before willHide. Scheduling
      // that event leaves a pending keyboard-duration LayoutAnimation which the
      // following clear would consume. Hide is intentionally asymmetric: the
      // footer may release behind the departing keyboard without trailing it.
      if (
        next.screenY !== null &&
        next.screenY >= Math.round(effectiveWindowHeightRef.current)
      ) return;
      scheduleKeyboardLayout(event);
      setKeyboardHeight(next.height);
      setKeyboardScreenY(next.screenY);
    };
    const clearKeyboardFrame = (_event: KeyboardEvent) => {
      setKeyboardHeight(0);
      setKeyboardScreenY(null);
    };

    if (Platform.OS === 'ios') {
      const showSub = Keyboard.addListener('keyboardWillShow', updateKeyboardFrame);
      const changeSub = Keyboard.addListener('keyboardWillChangeFrame', updateChangingKeyboardFrame);
      const hideSub = Keyboard.addListener('keyboardWillHide', clearKeyboardFrame);
      return () => {
        showSub.remove();
        changeSub.remove();
        hideSub.remove();
      };
    }

    const showSub = Keyboard.addListener('keyboardDidShow', updateKeyboardFrame);
    const hideSub = Keyboard.addListener('keyboardDidHide', clearKeyboardFrame);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardEnabled]);

  const frameKeyboardInset = keyboardEnabled
    ? resolveFrameKeyboardInset(
        keyboardHeight,
        keyboardScreenY,
        effectiveWindowHeight,
        baselineWindowHeight.current,
      )
    : 0;

  const value = React.useMemo<FixedRegionLayoutValue>(
    () => ({
      keyboardEnabled,
      hostGeometry,
      headerPresentation,
      keyboardHeight,
      keyboardScreenY,
      frameKeyboardInset,
      safeAreaTop: normalizeInset(safeAreaTop),
      safeAreaBottom: normalizeInset(safeAreaBottom),
      viewportFallbackHeight,
      dockTopInset,
      dockBottomInset,
      setDockTopInset,
      setDockBottomInset,
    }),
    [
      keyboardEnabled,
      hostGeometry,
      headerPresentation,
      keyboardHeight,
      keyboardScreenY,
      frameKeyboardInset,
      safeAreaTop,
      safeAreaBottom,
      viewportFallbackHeight,
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

export function useRegisterDockInset(
  edge: 'top' | 'bottom',
  consumerOnLayout?: (event: LayoutChangeEvent) => void,
): (event: LayoutChangeEvent) => void {
  const { setDockTopInset, setDockBottomInset } = useFixedRegionLayout();
  const report = edge === 'top' ? setDockTopInset : setDockBottomInset;
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
