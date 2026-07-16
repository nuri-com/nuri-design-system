// ════════════════════════════════════════════════════════════
// Modal — the single public blocking presented surface.
// `mode` is presentation, not identity: the registered layer, animated host,
// region provider, panel, and consumer subtree remain one stable tree.
// ════════════════════════════════════════════════════════════
import * as React from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import type { KeyboardEvent, LayoutChangeEvent, ViewStyle } from 'react-native';
import { blackAlpha } from '@nuri/spec/colours';
import { bottomSheetChrome } from '@nuri/spec/bottom-sheet-chrome';

import {
  ModalPanel as GeneratedModalPanel,
} from '../generated/components/modal-panel';
import { usePresentedLayer } from '../presented-layer';
import { useNuriSafeAreaInsets } from '../safe-area';
import { FixedRegionLayoutProvider, useFixedRegionLayout } from './FixedRegionLayout';

export type ModalMode = 'sheet' | 'full';
export type ModalScrim = 'none' | 'dim';

export type ModalProps = {
  open?: boolean;
  mode: ModalMode;
  scrim?: ModalScrim;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenComplete?: () => void;
  children?: React.ReactNode;
};

export type ModalPanelProps = {
  children?: React.ReactNode;
};

const CONTENT_MAX_FRACTION = 0.82;

const SHEET_ENTER_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
};
const SHEET_EXIT_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 220,
  easing: Easing.in(Easing.cubic),
  useNativeDriver: true,
};
const FULL_ENTER_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
};
const FULL_EXIT_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 180,
  easing: Easing.in(Easing.cubic),
  useNativeDriver: true,
};

const RN_SCRIM = {
  transparent: 'transparent',
  'blackAlpha.7': blackAlpha[7].value,
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);
const ModalModeContext = React.createContext<ModalMode | null>(null);

type ModalSurfaceProps = {
  children?: React.ReactNode;
  onLayout: (event: LayoutChangeEvent) => void;
  surfaceStyle: ViewStyle;
  animatedStyle: React.ComponentProps<typeof Animated.View>['style'];
};

const ModalSurface: React.FC<ModalSurfaceProps> = ({
  children,
  onLayout,
  surfaceStyle,
  animatedStyle,
}) => {
  const { frameKeyboardInset } = useFixedRegionLayout();
  const keyboardStyle = frameKeyboardInset > 0 ? { paddingBottom: frameKeyboardInset } : null;
  return (
    <Animated.View onLayout={onLayout} style={[surfaceStyle, animatedStyle, keyboardStyle]}>
      {children}
    </Animated.View>
  );
};
ModalSurface.displayName = 'ModalSurface';

type ActiveModal = { id: string; mode: ModalMode };
const activeModals: ActiveModal[] = [];
let warnedFullScrim = false;
let warnedSheetKeyboard = false;

function isDev(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export const Modal: React.FC<ModalProps> = ({
  open = false,
  mode,
  scrim,
  dismissible = true,
  onOpenChange,
  onOpenComplete,
  children,
}) => {
  const modalId = React.useId();
  const safeAreaInsets = useNuriSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [sheetHeight, setSheetHeight] = React.useState<number | null>(null);
  const measuredHeight = React.useRef<number | null>(null);

  const handleSurfaceLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    measuredHeight.current = next;
    setSheetHeight(next);
  }, []);

  React.useEffect(() => {
    if (!isDev() || mode !== 'full' || scrim === undefined || warnedFullScrim) return;
    warnedFullScrim = true;
    console.warn('[nuri] <Modal mode="full"> ignores `scrim`; full modals paint edge to edge.');
  }, [mode, scrim]);

  // A tiny dev-only registry lets each sheet tripwire ask whether it is the
  // topmost blocking Modal. Updating an existing entry preserves mount order.
  React.useLayoutEffect(() => {
    if (!isDev()) return;
    const index = activeModals.findIndex((entry) => entry.id === modalId);
    if (!open) {
      if (index >= 0) activeModals.splice(index, 1);
      return;
    }
    if (index >= 0) activeModals[index] = { id: modalId, mode };
    else activeModals.push({ id: modalId, mode });
  }, [modalId, mode, open]);
  React.useLayoutEffect(
    () => () => {
      if (!isDev()) return;
      const index = activeModals.findIndex((entry) => entry.id === modalId);
      if (index >= 0) activeModals.splice(index, 1);
    },
    [modalId],
  );

  React.useEffect(() => {
    if (!isDev() || !open || mode !== 'sheet') return;
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(event, (_keyboardEvent: KeyboardEvent) => {
      const top = activeModals[activeModals.length - 1];
      if (warnedSheetKeyboard || top?.id !== modalId || top.mode !== 'sheet') return;
      warnedSheetKeyboard = true;
      console.warn('[nuri] The keyboard opened over <Modal mode="sheet">. Inputs belong in mode="full".');
    });
    return () => subscription.remove();
  }, [modalId, mode, open]);

  const isSheet = mode === 'sheet';
  const sheetMaxHeight = Math.round(windowHeight * CONTENT_MAX_FRACTION);
  const surfaceStyle: ViewStyle = isSheet
    ? { width: '100%', maxHeight: sheetMaxHeight }
    : StyleSheet.absoluteFillObject;

  usePresentedLayer({
    open,
    ready: !isSheet || sheetHeight !== null,
    blocking: true,
    dismissible,
    onRequestClose: dismissible ? () => onOpenChange?.(false) : undefined,
    onEnterComplete: () => {
      onOpenChange?.(true);
      onOpenComplete?.();
    },
    onExitComplete: () => {
      measuredHeight.current = null;
      setSheetHeight(null);
    },
    enterTiming: isSheet ? SHEET_ENTER_TIMING : FULL_ENTER_TIMING,
    exitTiming: isSheet ? SHEET_EXIT_TIMING : FULL_EXIT_TIMING,
    renderLayer: ({ progress, requestClose }) => {
      const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [sheetHeight ?? windowHeight, 0],
      });
      const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.985, 1],
      });
      const animatedStyle = isSheet
        ? { transform: [{ translateY }] }
        : { opacity: progress, transform: [{ scale }] };

      return (
        <RNView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {isSheet && (scrim ?? 'dim') === 'dim' ? (
            <AnimatedPressable
              accessibilityRole={dismissible ? 'button' : undefined}
              disabled={!dismissible}
              onPress={dismissible ? requestClose : undefined}
              style={[styles.scrim, { opacity: progress }]}
            />
          ) : null}
          <RNView pointerEvents="box-none" style={styles.host}>
            <FixedRegionLayoutProvider
              keyboardEnabled={!isSheet}
              hostGeometry={isSheet ? 'content' : 'fill'}
              safeAreaTop={isSheet ? 0 : safeAreaInsets.top}
              safeAreaBottom={safeAreaInsets.bottom}
              viewportFallbackHeight={isSheet ? sheetMaxHeight : windowHeight}
              windowHeight={windowHeight}
            >
              <ModalSurface
                onLayout={handleSurfaceLayout}
                surfaceStyle={surfaceStyle}
                animatedStyle={animatedStyle}
              >
                <ModalModeContext.Provider value={mode}>
                  {children}
                </ModalModeContext.Provider>
              </ModalSurface>
            </FixedRegionLayoutProvider>
          </RNView>
        </RNView>
      );
    },
  });

  return null;
};
Modal.displayName = 'Modal';

export const ModalPanel: React.FC<ModalPanelProps> = (props) => {
  const mode = React.useContext(ModalModeContext) ?? 'sheet';
  return <GeneratedModalPanel {...props} mode={mode} />;
};
ModalPanel.displayName = 'ModalPanel';

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RN_SCRIM[bottomSheetChrome.scrim.dim],
  },
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
});
