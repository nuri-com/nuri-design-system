// ════════════════════════════════════════════════════════════════
// BottomSheet family — public Nuri API, a REGISTRAR into the overlay layer.
// No gestures by design (nuri-expo removed swipe-dismiss): scrim tap is
// the only built-in dismissal, so Animated/Pressable/ScrollView suffice —
// zero native deps beyond react-native itself.
//
// <BottomSheet open> stays the authored, DECLARATIVE API, but instead of
// drawing its absoluteFill overlay inline it REGISTERS that subtree into the
// OverlayProvider (the LayerHost <Layer> pattern) and returns null. The
// provider's outlet renders it full-window, ABOVE the consumer's safe-area
// padding — so the scrim covers the status bar and overlays can stack. The
// enter/exit slide + the sheet-height measurement latch are unchanged; only
// WHERE the subtree renders moved (inline → the provider outlet).
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  StyleSheet,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { blackAlpha } from '@nuri/spec/colours';
import { bottomSheetChrome } from '@nuri/spec/bottom-sheet-chrome';

import { useOverlay } from '../overlay';
import { BottomSheetPanel as GeneratedBottomSheetPanel } from '../generated/components/bottom-sheet-panel';

export type BottomSheetDetent = 'content' | 'full';
export type BottomSheetScrim = 'none' | 'dim';

export type BottomSheetProps = {
  open?: boolean;
  detent?: BottomSheetDetent;
  scrim?: BottomSheetScrim;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export type BottomSheetPanelProps = {
  children?: React.ReactNode;
};

export type BottomSheetScrollProps = {
  children?: React.ReactNode;
};

const DETENT_FRACTION: Record<Exclude<BottomSheetDetent, 'content'>, number> = {
  full: 0.96,
};
const CONTENT_MAX_FRACTION = 0.82;

const ENTER_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
};
const EXIT_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 220,
  easing: Easing.in(Easing.cubic),
  useNativeDriver: true,
};

const RN_SCRIM = {
  transparent: 'transparent',
  'blackAlpha.7': blackAlpha[7].value,
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open = false,
  detent = 'content',
  scrim = 'dim',
  dismissible = true,
  onOpenChange,
  children,
}) => {
  const overlay = useOverlay();
  const layerId = React.useId();
  const { height: windowHeight } = useWindowDimensions();
  const progress = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(open);
  // Measured sheet height doubles as the "ready to animate in" latch: the
  // enter slide waits for first layout so the travel distance is exact.
  const [sheetHeight, setSheetHeight] = React.useState<number | null>(null);
  const measuredHeight = React.useRef<number | null>(null);
  const openNotified = React.useRef(false);
  // Latest-callback ref: keeps onOpenChange out of the animation effects'
  // deps so a parent's inline lambda can't restart a running animation.
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  // Stable close handler for scrim tap AND hardware-back routing (the overlay
  // layer calls it on the topmost dismissible layer). Reads the latest callback
  // via the ref so its identity never changes.
  const requestClose = React.useCallback(() => {
    onOpenChangeRef.current?.(false);
  }, []);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    openNotified.current = false;
    if (!mounted) return;
    Animated.timing(progress, { ...EXIT_TIMING, toValue: 0 }).start(({ finished }) => {
      if (!finished) return;
      measuredHeight.current = null;
      setSheetHeight(null);
      setMounted(false);
    });
  }, [open, mounted, progress]);

  React.useEffect(() => {
    if (!open || !mounted || sheetHeight === null) return;
    Animated.timing(progress, { ...ENTER_TIMING, toValue: 1 }).start(({ finished }) => {
      if (finished && !openNotified.current) {
        openNotified.current = true;
        onOpenChangeRef.current?.(true);
      }
    });
  }, [open, mounted, sheetHeight, progress]);

  const handleSheetLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    // Latch the measured height for the enter-slide travel distance. Content-swap /
    // morph animation (content ↔ full) lands with D2 — see docs/bottom-sheet-improvements.md.
    measuredHeight.current = next;
    setSheetHeight(next);
  }, []);

  const translateY = React.useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [sheetHeight ?? windowHeight, 0],
      }),
    [progress, sheetHeight, windowHeight],
  );

  const sizeStyle: ViewStyle =
    detent === 'content'
      ? { maxHeight: Math.round(windowHeight * CONTENT_MAX_FRACTION) }
      : { height: Math.round(windowHeight * DETENT_FRACTION[detent]) };

  // The overlay subtree — identical to the old inline return (scrim +
  // KeyboardAvoidingView + the measured, translateY-slid Animated.View). It is
  // rebuilt each render (fresh translateY on a height/detent change) and
  // re-registered so the outlet shows the current node; the progress/translateY
  // Animated values are stable refs, so the enter/exit slide runs native-driven
  // on the already-mounted node without a re-render. Only built while mounted.
  const overlayNode = mounted ? (
    <RNView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {scrim === 'dim' ? (
        <AnimatedPressable
          accessibilityRole={dismissible ? 'button' : undefined}
          disabled={!dismissible}
          onPress={dismissible ? requestClose : undefined}
          style={[styles.scrim, { opacity: progress }]}
        />
      ) : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        style={styles.host}
      >
        <Animated.View onLayout={handleSheetLayout} style={[sizeStyle, { transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNView>
  ) : null;

  // Register the subtree into the overlay layer while mounted (the <Layer>
  // pattern): the outlet renders it full-window, above the safe-area padding.
  // useLayoutEffect keyed on the node + dismissible upserts it before paint;
  // the cleanup unregisters on close/unmount so a dismissed sheet leaves no
  // layer behind. A non-dim/non-dismissible sheet passes onRequestClose only
  // when dismissible, so hardware-back respects `dismissible`.
  React.useLayoutEffect(() => {
    if (!mounted) return undefined;
    overlay.register(layerId, overlayNode, {
      dismissible,
      onRequestClose: dismissible ? requestClose : undefined,
    });
    return () => overlay.unregister(layerId);
  }, [mounted, overlayNode, dismissible, requestClose, overlay, layerId]);

  return null;
};
BottomSheet.displayName = 'BottomSheet';

export const BottomSheetPanel: React.FC<BottomSheetPanelProps> = ({ children }) => (
  <GeneratedBottomSheetPanel>{children}</GeneratedBottomSheetPanel>
);
BottomSheetPanel.displayName = 'BottomSheetPanel';

export const BottomSheetScroll: React.FC<BottomSheetScrollProps> = ({ children }) => (
  <RNScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
    {children}
  </RNScrollView>
);
BottomSheetScroll.displayName = 'BottomSheetScroll';

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RN_SCRIM[bottomSheetChrome.scrim.dim],
  },
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
  } satisfies ViewStyle,
});
